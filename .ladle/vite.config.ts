import "reflect-metadata";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { campaignCatalogPlugin } from "../apps/kampanykorut/plugins/campaignCatalog";

const root = path.resolve(__dirname, "..");
const appRoot = path.resolve(root, "apps/kampanykorut");

export default defineConfig({
  resolve: {
    alias: {
      "@logic": path.resolve(appRoot, "src/logic"),
      "@shared": path.resolve(root, "shared"),
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
  plugins: [
    react({ tsDecorators: true }),
    tailwindcss(),
    campaignCatalogPlugin(path.resolve(appRoot, "public")),
  ],
});
