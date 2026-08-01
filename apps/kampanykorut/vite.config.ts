// <reference types="vitest/config" />
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(readFileSync("./package.json", "utf-8")) as {
  version: string;
};

let gitCommit = process.env.GIT_COMMIT ?? "unknown";
if (gitCommit === "unknown") {
  try {
    gitCommit = execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    // not a git repo or no commits yet
  }
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __GIT_COMMIT__: JSON.stringify(gitCommit),
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    exclude: ["playwright", "playwright-report"],
  },
  plugins: [react(), svgr(), tailwindcss()],
  test: {
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    environment: "jsdom",
    include: ["**/*.test.ts"],
    silent: false,
    onConsoleLog() {
      return false;
    },
    coverage: {
      reporter: ["text", "lcov"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 50,
        statements: 70,
      },
    },
    projects: [
      {
        extends: true,
        plugins: [],
      },
    ],
  },
  resolve: {
    alias: {
      "@/logic/application": path.resolve(__dirname, "src/logic/application"),
      "@/logic/types": path.resolve(__dirname, "src/logic/types"),
      "@/shared/logger": path.resolve(__dirname, "../../shared/logger"),
      "@/shared/domain": path.resolve(__dirname, "../../shared/domain"),
      "@/shared/types": path.resolve(__dirname, "../../shared/types"),
    },
  },
});
