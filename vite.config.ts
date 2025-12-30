import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: { port: 3000 },
  plugins: [react(), svgr(), tailwindcss()],
    test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
