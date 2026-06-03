import { defineConfig } from 'vite';
import path from 'path';

const root = path.resolve(__dirname, '..');

export default defineConfig({
  resolve: {
    alias: {
      "@/logic/application": path.resolve(root, "src/logic/application"),
      "@/logic/types": path.resolve(root, "src/logic/types"),
      "@/shared/logger": path.resolve(root, "shared/logger/logger"),
      "@/shared/domain": path.resolve(root, "shared/domain"),
      "@/shared/types": path.resolve(root, "shared/types"),
    },
  },
});