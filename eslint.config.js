// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {},
      },
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    ignores: ["src/dev/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/logic/domain',
            from: './src/logic/application',
            message: 'Application layer cannot import from domain directly',
          },
        ],
      },
    ],
    },
  },
]);
