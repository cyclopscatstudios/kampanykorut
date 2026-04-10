// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
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
      "@/logic/application": "/src/logic/application",
      "@/logic/domain": "/src/logic/domain",
    },
  },
});
