import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
  },
  resolve: {
    alias: {
      "@/shared/logger": path.resolve(__dirname, "../../shared/logger"),
      "@/shared/domain": path.resolve(__dirname, "../../shared/domain"),
      "@/shared/types": path.resolve(__dirname, "../../shared/types"),
    },
  },
});
