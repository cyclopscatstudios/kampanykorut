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
  plugins: [react(), svgr(), tailwindcss()],
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts"],
    silent: false,
    onConsoleLog() {
      return false;
    },
    projects: [
      {
        extends: true,
        plugins: [],
      },
    ],
  },
});
