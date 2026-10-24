# Campaign Maker narrative beta — implementation report

## Handoff identity

- Baseline: local `origin/dev` `c3db267a00d1d5671725cde3eb329361cb6a3579`; remote freshness remains unverified because managed GitHub capability was unavailable.
- Isolated branch/worktree: `cyc-10-campaign-maker-beta` at `/paperclip/instances/default/projects/80c2eb32-036b-4db5-876c-c32c3a8b5717/a62625d7-fe13-4fe4-817b-a6040c11f077/_default/repo`.
- Implementation commit: `d9de4bdbcc6791e37cdd008411fc1faca1f7de9a` (`feat: add Campaign Maker narrative beta`). No push, merge, deployment, production mutation, secret access, or protected-branch change was performed.
- Contract: [Campaign Maker narrative beta contract](/CYC/issues/CYC-10#document-contract), revision `f708135b-0177-4024-ba60-08b92924f728`. Repository copy: `docs/campaign-maker-beta-contract.md`.

## Delivered implementation

- A versioned, deterministic, dependency-free single-JSON campaign envelope with 2 MiB/64-file/512 KiB-per-file/path/depth checks, safe-path rejection, finite-number/prototype-key checks, schema-v1 gating, canonical shared-validator execution, and delayed object-URL cleanup.
- Complete `2026_tavaszi-szel` one-side starter hydration using the shipped files. Imported data is validated before draft replacement; export overlays supported fields on a cloned complete bundle, preserving locked JSON fields and asset references. Nested `baseResults` remains correctly keyed by playable side.
- Versioned local drafts, debounced autosave with visible saved/failed state, in-memory retention on write failure, discover/reopen/delete UI, named delete/replace confirmation, export recovery, and import diagnostics. The Maker states that content stays in the browser.
- Hungarian desktop authoring for campaign identity, existing party labels/colors/votes, playable-side/candidate text, question/answer copy, advisor feedback, bounded `uniform-swing` effects, and candidate endings. Electoral/district/voter baseline and IDs are visibly locked. Placeholder steps are removed.
- Canonical validation summary with blocking export/preview. Local preview uses a random UUID, a separately namespaced record with 30-minute expiry, and the main game’s existing `CampaignEngine`, `ConfigEngine`, state, UI, and results routes. HTTP campaign loading remains the default; no preview is registered in `game_modes.json` and no shared storage clearing was added.
- `/maker/` Vite base/router, existing-image build/copy, explicit nginx Maker and preview SPA fallbacks, no-cache Maker HTML, and disabled discovery (no root-game link). CI now builds and unit-tests Maker in addition to existing gates.
- Accessible native labels/fieldsets/details, live save/diagnostic status, keyboard-operable controls, desktop reflow, and a pre-edit mobile guard that preserves drafts and leaves export available.
- Four pure bundle-boundary tests: malformed JSON, future version, traversal, and deterministic serialization.

## Changed paths

- Contract/report: `docs/campaign-maker-beta-contract.md`, this report.
- Bundle, starter, tests: `apps/campaign-maker/src/logic/bundle/*`.
- Draft lifecycle and editor UI: `CampaignBundleContext.tsx`, Maker menu/header/layout/router/form controls, and candidate/narrative/summary steps under `apps/campaign-maker/src/`.
- Runtime preview: `apps/kampanykorut/src/components/loaders/makerPreview.loader.ts`, `loadCampaignConfig.ts`, and main-game router.
- Packaging/gates: `Dockerfile`, `apps/kampanykorut/nginx.conf`, Maker Vite/TypeScript/package config, and `.github/workflows/github-ci.yml`.

## Reproduction and verification

From repository root on a prepared Node 22/Yarn 1 environment:

```text
yarn install --frozen-lockfile
yarn workspace campaign-maker test
yarn build:cmaker
yarn validate:campaigns
yarn test -- --coverage
yarn lint
yarn format:check
docker build -t kampanykorut:cyc-10 .
```

Then serve the image without enabling a game navigation link, open `/maker/`, complete edit → reload → export → import/replace confirmation → validate → preview → results → return/reopen, and smoke `/`, `/assets/`, `/api/`, Maker deep links, and preview deep links.

Verified here:

- `git diff --check`: passed before commit.
- Working tree after commit: clean; commit identity and baseline recorded.
- Contract task-document write: confirmed revision above.

Blocked here (not passed):

- `yarn build:cmaker`: failed at `/bin/sh: tsc: not found` (exit 127).
- `yarn workspace campaign-maker test`: failed at `/bin/sh: vitest: not found` (exit 127).
- Lint, format check, shipped validation, main-game tests, Docker build, and all browser/E2E checks were not executed because the checkout has no installed dependency tree. No dependency or browser/system-library installation was attempted. CI was not triggered because push is unauthorized.

## Readiness, risks, and remaining checks

The commit is a reviewable implementation candidate, but **not yet ready for independent QA certification or release review** until a prepared environment proves type-check/build/unit/regression gates. Bob can hand the exact commit/artifact to Quinn for code review while treating execution as pending; mandatory failed or unexecuted checks remain blockers to any readiness claim.

Highest residual risks are unexecuted TypeScript/format checks, preview state/expiry behavior across all results paths, storage quota/corruption/multi-tab behavior beyond the implemented visible failure path, and browser-specific file/download/focus behavior. Independent QA must execute RB-01–RB-13 on the exact commit in Chromium/Firefox and WebKit regression coverage. Real Safari remains unverified. Android/iOS must verify the guard, non-mutation, and recovery export; editing remains unsupported. Manual 200% zoom, keyboard, screen-reader/status, long-Hungarian-text, forced-color, direct/deep-link, cache, root/API routing, and full preview-to-results checks remain.

Owner review is still required for starter rights/credits, political-content classification, privacy/beta/support wording, feedback destination, and any public link. No deployment, merge, push, release approval, or public availability is implied.
