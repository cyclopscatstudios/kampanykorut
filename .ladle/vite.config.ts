import "reflect-metadata";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

const root = path.resolve(__dirname, "..");
const appRoot = path.resolve(root, "apps/kampanykorut");

export default defineConfig({
  resolve: {
    alias: {
      "@/logic/application": path.resolve(appRoot, "src/logic/application"),
      "@/logic/types": path.resolve(appRoot, "src/logic/types"),
      "@/shared/logger": path.resolve(root, "shared/logger"),
      "@/shared/domain": path.resolve(root, "shared/domain"),
      "@/shared/types": path.resolve(root, "shared/types"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
        },
      },
    },
  },
  plugins: [react({ tsDecorators: true }), tailwindcss()],
});
