import { spawn } from "node:child_process";
import { once } from "node:events";

import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/server.ts"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  outDir: "dist",
  sourcemap: true,
  clean: true,
  splitting: false,
  onSuccess: options.watch
    ? async () => {
        const server = spawn(
          process.execPath,
          [
            "--env-file-if-exists=.env",
            "--enable-source-maps",
            "dist/server.js",
          ],
          { stdio: "inherit" },
        );

        return async () => {
          if (server.exitCode !== null) return;
          server.kill("SIGTERM");
          await once(server, "exit");
        };
      }
    : undefined,
}));
