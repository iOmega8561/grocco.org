import { readFile } from "node:fs/promises";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { handleStatus } from "./server/status/core.ts";
import { send, toRequest } from "./server/node/http.ts";
import { memoryStore } from "./server/node/stores.ts";

/**
 * In development only, runs the real status endpoint at /api/status, kept in memory and seeded from
 * dev/status.sample.json, so the live panel works without a server:
 *
 *   VITE_STATUS_URL=/api/status npm run dev
 *
 * The token is "dev", so reports can be sent by hand with curl to try the panel's states.
 */
function devStatus(): Plugin {
  return {
    name: "dev-status",
    apply: "serve",
    async configureServer(server) {
      const report = JSON.parse(await readFile(new URL("./dev/status.sample.json", import.meta.url), "utf8"));
      const store = memoryStore(JSON.stringify({ receivedAt: new Date(Date.now() - 12_000).toISOString(), report }));
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split("?")[0] !== "/api/status") return next();
        try {
          await send(res, await handleStatus(await toRequest(req, 32 * 1024), store, { token: "dev", staleAfterSeconds: 900 }));
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devStatus()],
  build: { target: "es2022", sourcemap: false },
});
