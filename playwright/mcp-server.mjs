import { spawn } from "node:child_process";
import { realpathSync } from "node:fs";

const child = spawn(
  "npx",
  ["playwright", "run-test-mcp-server", ...process.argv.slice(2)],
  { cwd: realpathSync.native(process.cwd()), stdio: "inherit", shell: true },
);

child.on("exit", (code) => process.exit(code ?? 0));
