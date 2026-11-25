import { mergeConfig } from "vite";
import baseConfig from "./vite.config";

export default mergeConfig(baseConfig, {
  build: {
    ssr: "src/prerender/entry-server.tsx",
    outDir: "dist-ssr",
    emptyOutDir: true,
    copyPublicDir: false,
  },
});
