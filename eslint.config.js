// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import { defineConfig, globalIgnores } from "eslint/config";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default defineConfig([
  globalIgnores(["dist", "playwright"]),
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
      "simple-import-sort": simpleImportSort,
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
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/logic/domain",
              from: "./src/logic/application",
              message: "Application layer cannot import from domain directly",
            },
          ],
        },
      ],
      "simple-import-sort/imports": [
        "error",
        { groups: [["^\\u0000", "^node:", "^@?\\w", "^", "^\\."]] },
      ],
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/no-duplicates": "error",
    },
  },
]);
