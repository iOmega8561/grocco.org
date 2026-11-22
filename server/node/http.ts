import type { IncomingMessage, ServerResponse } from "node:http";

export class BodyTooLarge extends Error {}

/** Builds a web Request from a Node request, reading at most `maxBytes` of body. */
export async function toRequest(req: IncomingMessage, maxBytes: number): Promise<Request> {
  const url = new URL(req.url ?? "/", "http://localhost");
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) headers.append(name, item);
  }

  const method = req.method ?? "GET";
  if (method === "GET" || method === "HEAD") return new Request(url, { method, headers });

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > maxBytes) throw new BodyTooLarge();
    chunks.push(chunk as Buffer);
  }
  return new Request(url, { method, headers, body: Buffer.concat(chunks) });
}

/** Writes a web Response to a Node response. */
export async function send(res: ServerResponse, response: Response, extraHeaders: Record<string, string> = {}): Promise<void> {
  const headers: Record<string, string> = { ...extraHeaders };
  response.headers.forEach((value, name) => {
    headers[name] = value;
  });
  res.writeHead(response.status, headers);
  res.end(response.body ? Buffer.from(await response.arrayBuffer()) : undefined);
}
