import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { StatusStore } from "../status/core.ts";

/** Keeps the last report in memory only: for development, or when losing it on restart is fine. */
export function memoryStore(initial: string | null = null): StatusStore {
  let value = initial;
  return {
    get: async () => value,
    put: async (next) => {
      value = next;
    },
  };
}

/**
 * Keeps the last report in one JSON file, so a restart still knows when the server was last seen.
 * Served from memory; every write replaces the file atomically.
 */
export async function fileStore(path: string): Promise<StatusStore> {
  let value: string | null = null;
  try {
    value = await readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  await mkdir(dirname(path), { recursive: true });

  return {
    get: async () => value,
    put: async (next) => {
      const temporary = join(dirname(path), `.status.${process.pid}.${Date.now()}.tmp`);
      await writeFile(temporary, next, { mode: 0o600 });
      await rename(temporary, path);
      value = next;
    },
  };
}
