/**
 * Cloudflare Pages: /api/status, backed by Workers KV.
 *
 * Project settings → Bindings: a KV namespace bound as STATUS.
 * Project settings → Variables and secrets: STATUS_TOKEN (secret), optionally STATUS_STALE_AFTER in seconds.
 */
import { handleStatus, parseStaleAfter, type StatusStore } from "../../server/status/core.ts";

/** The part of the Workers KV binding used here, so no Cloudflare type package is needed. */
type KV = {
  get(key: string, options?: { cacheTtl?: number }): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

type Env = { STATUS?: KV; STATUS_TOKEN?: string; STATUS_STALE_AFTER?: string };

const key = "status";

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const kv = env.STATUS;
  if (!kv) {
    return new Response(JSON.stringify({ error: "the STATUS KV binding is missing" }), {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  const store: StatusStore = {
    // Each data center may serve a copy up to a minute old: far below the offline threshold,
    // and it keeps KV reads low however many people have the page open.
    get: () => kv.get(key, { cacheTtl: 60 }),
    put: (value) => kv.put(key, value),
  };
  return handleStatus(request, store, {
    token: env.STATUS_TOKEN,
    staleAfterSeconds: parseStaleAfter(env.STATUS_STALE_AFTER),
  });
}
