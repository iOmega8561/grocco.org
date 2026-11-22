import { readFile } from "node:fs/promises";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * In development only, serves dev/status.sample.json at /__status.json, so the live panel
 * can be designed without a server: VITE_STATUS_URL=/__status.json npm run dev
 */
function sampleStatus(): Plugin {
  return {
    name: "sample-status",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__status.json", async (_req, res) => {
        const body = JSON.parse(await readFile(new URL("./dev/status.sample.json", import.meta.url), "utf8"));
        body.generatedAt = new Date(Date.now() - 12_000).toISOString();
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(body));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), sampleStatus()],
  build: { target: "es2022", sourcemap: false },
});
