/**
 * The status endpoint, written against the web-standard Request and Response so the same code runs
 * on Cloudflare Pages Functions (functions/api/status.ts) and on Node (server/node/main.ts).
 *
 *   PUT /api/status   Authorization: Bearer <token>, body: a StatusReport. Replies 204.
 *   GET /api/status   Replies with a StatusResponse: the last report, its age and whether it is fresh.
 *
 * The time of a report is when the endpoint received it, never the clock of the server that sent it.
 */

export type ContainerStatus = {
  name: string;
  state: string;
  health: string | null;
  startedAt: string | null;
};

/** What status-agent.sh sends. */
export type StatusReport = {
  generatedAt: string;
  host: { kernel: string; uptimeSeconds: number };
  containers: ContainerStatus[];
};

/** What GET returns. `report` is null until the first report arrives. */
export type StatusResponse = {
  online: boolean;
  receivedAt: string | null;
  ageSeconds: number | null;
  staleAfterSeconds: number;
  report: StatusReport | null;
};

/** Where the last report is kept: Workers KV on Cloudflare, a file when self-hosted, memory in development. */
export interface StatusStore {
  get(): Promise<string | null>;
  put(value: string): Promise<void>;
}

export type StatusOptions = {
  /** The secret the agent sends. While empty, PUT is refused, so a forgotten secret never opens the endpoint. */
  token: string | undefined;
  /** A report older than this means the server is off. */
  staleAfterSeconds: number;
  now?: () => Date;
};

type Stored = { receivedAt: string; report: StatusReport };

const maxBodyBytes = 16 * 1024;
const maxContainers = 64;
const maxText = 128;

export const defaultStaleAfterSeconds = 15 * 60;

/** Reads a threshold from configuration, falling back to the default on anything that is not a positive number. */
export function parseStaleAfter(value: string | undefined): number {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : defaultStaleAfterSeconds;
}

export async function handleStatus(request: Request, store: StatusStore, options: StatusOptions): Promise<Response> {
  switch (request.method) {
    case "GET":
    case "HEAD":
      return read(request.method, store, options);
    case "PUT":
      return write(request, store, options);
    default:
      return json({ error: "method not allowed" }, 405, { Allow: "GET, HEAD, PUT" });
  }
}

async function read(method: string, store: StatusStore, options: StatusOptions): Promise<Response> {
  const now = (options.now ?? (() => new Date()))();
  const stored = decode(await store.get());
  const ageSeconds = stored ? Math.max(0, Math.round((now.getTime() - Date.parse(stored.receivedAt)) / 1000)) : null;
  const body: StatusResponse = {
    online: ageSeconds !== null && ageSeconds <= options.staleAfterSeconds,
    receivedAt: stored?.receivedAt ?? null,
    ageSeconds,
    staleAfterSeconds: options.staleAfterSeconds,
    report: stored?.report ?? null,
  };
  const response = json(body, 200);
  return method === "HEAD" ? new Response(null, { status: 200, headers: response.headers }) : response;
}

async function write(request: Request, store: StatusStore, options: StatusOptions): Promise<Response> {
  if (!options.token) return json({ error: "status updates are not configured" }, 503);
  if (!(await authorized(request.headers.get("Authorization"), options.token))) {
    return json({ error: "unauthorized" }, 401, { "WWW-Authenticate": 'Bearer realm="status"' });
  }

  const declared = Number(request.headers.get("Content-Length") ?? 0);
  if (declared > maxBodyBytes) return json({ error: "report too large" }, 413);
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBodyBytes) return json({ error: "report too large" }, 413);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return json({ error: "body is not JSON" }, 400);
  }
  const report = sanitize(parsed);
  if (!report) return json({ error: "body is not a status report" }, 422);

  const now = (options.now ?? (() => new Date()))();
  const stored: Stored = { receivedAt: now.toISOString(), report };
  await store.put(JSON.stringify(stored));
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

/**
 * Compares SHA-256 digests of the two values byte by byte without stopping early, so the time taken
 * says nothing about how much of the token was right. Works the same on Workers and Node.
 */
async function authorized(header: string | null, token: string): Promise<boolean> {
  const match = /^Bearer\s+(.+)$/i.exec(header ?? "");
  if (!match) return false;
  const encoder = new TextEncoder();
  const [given, expected] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(match[1].trim())),
    crypto.subtle.digest("SHA-256", encoder.encode(token)),
  ]);
  const a = new Uint8Array(given);
  const b = new Uint8Array(expected);
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}

/** Rebuilds the report from known fields only, so nothing unexpected is ever stored or served. */
function sanitize(value: unknown): StatusReport | null {
  if (!isObject(value) || !isObject(value.host) || !Array.isArray(value.containers)) return null;
  if (!isText(value.generatedAt) || !isText(value.host.kernel)) return null;
  const uptime = value.host.uptimeSeconds;
  if (typeof uptime !== "number" || !Number.isFinite(uptime) || uptime < 0) return null;
  if (value.containers.length > maxContainers) return null;

  const containers: ContainerStatus[] = [];
  for (const item of value.containers) {
    if (!isObject(item) || !isText(item.name) || !isText(item.state)) return null;
    if (item.health !== null && !isText(item.health)) return null;
    if (item.startedAt !== null && !isText(item.startedAt)) return null;
    containers.push({ name: item.name, state: item.state, health: item.health, startedAt: item.startedAt });
  }
  return {
    generatedAt: value.generatedAt,
    host: { kernel: value.host.kernel, uptimeSeconds: Math.floor(uptime) },
    containers,
  };
}

function decode(raw: string | null): Stored | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Stored;
    return typeof value.receivedAt === "string" && sanitize(value.report) ? value : null;
  } catch {
    return null;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maxText;
}

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}
