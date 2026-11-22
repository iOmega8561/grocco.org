/**
 * Self-hosted server: the built site from DIST_DIR and the status endpoint at /api/status,
 * with no dependencies beyond Node. Meant to run behind a reverse proxy (Traefik, Caddy, nginx)
 * that terminates TLS and compresses responses.
 *
 * Environment:
 *   PORT                 default 8080
 *   HOST                 default 0.0.0.0
 *   DIST_DIR             default ./dist
 *   STATUS_TOKEN_FILE    file holding the agent's token (a Podman secret); preferred over STATUS_TOKEN
 *   STATUS_TOKEN         the token itself; while both are empty, status updates are refused
 *   STATUS_FILE          where the last report is kept; while empty, it is kept in memory only
 *   STATUS_STALE_AFTER   seconds without a report before the server counts as off, default 900
 */
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { handleStatus, parseStaleAfter, type StatusStore } from "../status/core.ts";
import { BodyTooLarge, send, toRequest } from "./http.ts";
import { fileStore, memoryStore } from "./stores.ts";

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? "0.0.0.0";
const dist = resolve(process.env.DIST_DIR ?? "dist");

const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".pdf": "application/pdf",
};

/** Files that configure Cloudflare Pages and are never served there either. */
const hidden = new Set(["/_headers", "/_redirects", "/_routes.json"]);

type HeaderRule = { pattern: RegExp; headers: [string, string][] };

/**
 * Reads the same public/_headers file Cloudflare Pages uses, so both deployments send the same
 * security and cache headers. Supports its common form: a path with `*` wildcards, then indented
 * `Name: value` lines.
 */
async function loadHeaderRules(): Promise<HeaderRule[]> {
  let text: string;
  try {
    text = await readFile(join(dist, "_headers"), "utf8");
  } catch {
    return [];
  }
  const rules: HeaderRule[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      const source = line.trim().replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
      rules.push({ pattern: new RegExp(`^${source}$`), headers: [] });
      continue;
    }
    const separator = line.indexOf(":");
    if (separator > 0 && rules.length) {
      rules[rules.length - 1].headers.push([line.slice(0, separator).trim(), line.slice(separator + 1).trim()]);
    }
  }
  return rules;
}

function headersFor(pathname: string, rules: HeaderRule[]): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const rule of rules) {
    if (rule.pattern.test(pathname)) for (const [name, value] of rule.headers) headers[name] = value;
  }
  return headers;
}

async function readToken(): Promise<string | undefined> {
  const file = process.env.STATUS_TOKEN_FILE;
  if (file) return (await readFile(file, "utf8")).trim() || undefined;
  return process.env.STATUS_TOKEN?.trim() || undefined;
}

/** Resolves a URL path inside DIST_DIR, or null if it would leave it. */
function inside(pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) return null;
  const path = resolve(dist, `.${decoded}`);
  return path === dist || path.startsWith(dist + sep) ? path : null;
}

async function fileAt(path: string | null) {
  if (!path) return null;
  try {
    const info = await stat(path);
    return info.isFile() ? { path, info } : null;
  } catch {
    return null;
  }
}

async function serveStatic(req: IncomingMessage, res: ServerResponse, pathname: string, rules: HeaderRule[]) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let file = hidden.has(pathname) ? null : await fileAt(inside(pathname));
  // Every route belongs to the single-page app; a missing file with an extension is a real 404.
  if (!file && !extname(pathname)) file = await fileAt(join(dist, "index.html"));
  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", ...headersFor(pathname, rules) }).end("Not found");
    return;
  }

  const { path, info } = file;
  const etag = `W/"${info.size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`;
  const headers: Record<string, string> = {
    "Content-Type": types[extname(path).toLowerCase()] ?? "application/octet-stream",
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Accept-Ranges": "bytes",
    "Last-Modified": info.mtime.toUTCString(),
    ETag: etag,
    ...headersFor(pathname, rules),
  };

  if (req.headers["if-none-match"] === etag) {
    res.writeHead(304, headers).end();
    return;
  }

  // Byte ranges: Safari will not play a video without them.
  let start = 0;
  let end = info.size - 1;
  let status = 200;
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
  if (range && (range[1] || range[2])) {
    if (range[1]) {
      start = Number(range[1]);
      if (range[2]) end = Math.min(Number(range[2]), end);
    } else {
      start = Math.max(0, info.size - Number(range[2]));
    }
    if (start > end || start >= info.size) {
      res.writeHead(416, { ...headers, "Content-Range": `bytes */${info.size}` }).end();
      return;
    }
    status = 206;
    headers["Content-Range"] = `bytes ${start}-${end}/${info.size}`;
  }
  headers["Content-Length"] = String(end - start + 1);

  res.writeHead(status, headers);
  if (req.method === "HEAD" || info.size === 0) {
    res.end();
    return;
  }
  createReadStream(path, { start, end })
    .on("error", () => res.destroy())
    .pipe(res);
}

async function main() {
  const rules = await loadHeaderRules();
  const token = await readToken();
  const staleAfterSeconds = parseStaleAfter(process.env.STATUS_STALE_AFTER);
  const store: StatusStore = process.env.STATUS_FILE ? await fileStore(process.env.STATUS_FILE) : memoryStore();

  if (!token) console.warn("status: no token configured; updates to /api/status are refused");

  const server = createServer(async (req, res) => {
    const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
    try {
      if (pathname === "/healthz") {
        res.writeHead(204, { "Cache-Control": "no-store" }).end();
      } else if (pathname === "/api/status") {
        const request = await toRequest(req, 32 * 1024);
        await send(res, await handleStatus(request, store, { token, staleAfterSeconds }), headersFor(pathname, rules));
      } else {
        await serveStatic(req, res, pathname, rules);
      }
    } catch (error) {
      if (error instanceof BodyTooLarge) {
        if (!res.headersSent) res.writeHead(413, { Connection: "close" });
        res.end();
        return;
      }
      console.error(error);
      if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end();
    }
  });

  server.requestTimeout = 30_000;
  server.headersTimeout = 10_000;
  server.listen(port, host, () => console.log(`serving ${dist} on http://${host}:${port}`));

  const stop = () => server.close(() => process.exit(0));
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
