/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SEASON?: string;
}

declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;
declare const __GIT_COMMIT__: string;

declare module "*.svg?react" {
  import * as React from "react";
  const Component: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default Component;
}
