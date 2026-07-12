import "reflect-metadata";
import path from "path";
import { defineConfig } from "vite";

const root = path.resolve(__dirname, "..");

export default defineConfig({
  resolve: {
    alias: {
      "@/logic/application": path.resolve(root, "src/logic/application"),
      "@/logic/types": path.resolve(root, "src/logic/types"),
      "@/shared/logger": path.resolve(root, "shared/logger"),
      "@/shared/domain": path.resolve(root, "shared/domain"),
      "@/shared/types": path.resolve(root, "shared/types"),
    },
  },
});
