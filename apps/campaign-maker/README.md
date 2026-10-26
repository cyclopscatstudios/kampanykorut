# Campaign Maker

The Campaign Maker is a template-constrained, local-first campaign editor. Its
production build is served at `/maker/` beside the game so preview records and
the return link share one origin.

## Canonical browser journey

`playwright/maker/canonical-journey.spec.ts` is the maintained executable beta
journey. It creates a draft from the shipped starter, makes meaningful candidate,
narrative, feedback and numeric-effect changes, verifies save/reload, exports,
imports into a distinct new draft, validates, previews through the real game to
results, returns to the editor and checks that the authored data survived.

The fixture strategy deliberately uses the shipped starter loaded by the UI and
the browser-generated export. It does not maintain a second hand-edited bundle,
so the journey exercises the production hydration, assembly and round-trip path.
Each run starts in a fresh Playwright browser context and creates random draft
and preview IDs.

Run the same-origin production image in one terminal:

```sh
docker build -t kampanykorut-maker-e2e .
docker run --rm --name kampanykorut-maker-e2e -p 3000:80 kampanykorut-maker-e2e
```

Then run the journey from another terminal:

```sh
yarn playwright:maker --project=chromium
yarn playwright:maker --project=firefox
yarn playwright:maker --project=webkit
```

Set `MAKER_E2E_BASE_URL` when the prepared same-origin image is available at a
different URL. Browser binaries and their system libraries must already exist;
these commands do not install host packages or download browsers.

## Vite scaffold notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
