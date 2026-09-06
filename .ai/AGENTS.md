# Kampánykörút – Agent Guide

## What is this application?

**Kampánykörút** is a domain-driven Hungarian election simulation game. The player makes policy decisions that deterministically affect party vote shares and seat distributions according to the real Hungarian electoral system (OEVK single-member districts + party lists + compensation lists).

Tech stack: React + TypeScript, Vite, Vitest, tsyringe DI, Tailwind CSS.

---

## Repo layout (Yarn Classic workspaces monorepo)

All paths in this guide are relative to the **repo root** (`D:\hobby\kampanykorut`), not to any app folder.

```
apps/kampanykorut/   → the game itself (this guide is mostly about this app)
apps/campaign-maker/ → campaign authoring tool (separate, minimal scaffold)
shared/               → domain logic, types, logger, and UI primitives shared across apps
  domain/             → pure business logic (see Domain Layer below)
  types/              → TypeScript-only type definitions
  logic/hooks/        → shared React hooks (e.g. useTranslateLang), used across apps
  ui/                 → shared presentational components (Button, Icon, Text, menu/)
  logger/             → logger utility
brand-assets/         → shared logos/svgs used by both apps
```

There is no root-level `src/` or `public/` — those live under `apps/kampanykorut/` (and, separately, `apps/campaign-maker/`).

---

## Commands

Run from the **repo root** with Yarn Classic (`packageManager: yarn@1.22.22` — use `corepack enable` if needed). `npm run <script>` only works for the bare `dev`/`build`/`preview` scripts if your cwd is already `apps/kampanykorut`; everything else (lint/format/test) is a root-level script.

```bash
yarn install            # installs all workspaces from the repo root

yarn kampanykorut       # dev server for the game: http://localhost:3000
yarn kampanykorut:landing  # same, with VITE_LANDING=true (landing-page routing mode)
yarn cmaker              # dev server for campaign-maker: http://localhost:3001

yarn build:kampanykorut # tsc -b + vite build for the game
yarn build:cmaker        # build campaign-maker

yarn test                # Vitest, watch mode, scoped to apps/kampanykorut/vite.config.ts
yarn lint / yarn lint:fix
yarn format / yarn format:check
yarn ladle               # Ladle component explorer: http://localhost:6006

yarn playwright          # Playwright e2e tests (UI mode)
yarn playwright:headed   # Playwright e2e tests, headed
yarn playwright:ct       # Playwright component tests (UI mode), config: apps/kampanykorut/playwright-ct.config.ts
```

Run a single test file:

```bash
yarn vitest run --config apps/kampanykorut/vite.config.ts apps/kampanykorut/src/path/to/file.test.ts
```

---

## Layer Boundaries (strictly enforced)

```
shared/domain/                     → Pure, deterministic business logic. Zero React imports.
shared/types/                      → TypeScript type definitions. No logic, no React.
shared/logger/                     → Logger utility.
shared/ui/                         → Shared presentational primitives (Button, Icon, Text, menu/).
shared/logic/hooks/                → Shared React hooks used by both apps.
apps/kampanykorut/src/logic/application/ → Domain orchestration: hooks, state machine, persistence, DI.
apps/kampanykorut/src/components/  → React UI only. No calculation logic.
apps/kampanykorut/src/di/          → tsyringe container setup (container.ts).
apps/kampanykorut/src/debug/       → Runtime debug-mode toggle (window.debugMode), wired up in main.tsx.
apps/kampanykorut/src/testing/     → Dev-only debug API (window.kampanykorut), see "Dev/Debug Tooling" below.
```

There is no dedicated dev-only route. Unpublished campaigns (`isPublished: false` in `game_modes.json`) are hidden from the campaign selector unless `window.debugMode.enabled` is toggled on from the browser console.

**Forbidden crossings:**

- `shared/domain/` must not import from `apps/`
- `apps/kampanykorut/src/components/` must not contain calculation logic
- `apps/kampanykorut/src/logic/domain/` does not exist — domain lives in the `shared/` package

---

## Dev/Debug Tooling (in-browser, `import.meta.env.DEV` only)

Two globals are wired up in `main.tsx` via `initDevApi()` (`apps/kampanykorut/src/initApi.ts`), useful for reproducing game state from the browser console **without playing through turns manually**:

### `window.debugMode`

```js
window.debugMode.enable(); // or .toggle()
```

Persists to `localStorage` (`kampanykorut_debugMode`). Reveals unpublished campaigns (`isPublished: false` in `game_modes.json`) in the campaign selector.

### `window.kampanykorut` (`CampaignApi`, `apps/kampanykorut/src/testing/campaignSeeder.ts`)

```js
const { sessionId, state } = await window.kampanykorut.seedCampaign(
  "2026_tavaszi_szel", // id from game_modes.json — NOT the folder/`route` name
  { partyId: "tisza", candidateId: "magyar_peter" }, // PlayerSide, matches election_config.json playableSides
);
```

This loads the full `CampaignConfig` (via `loadCampaignConfig`), configures `ConfigEngine`, and sets `activeCampaignId`/`playerSide` on `StateEngine` — equivalent to what the New Game → side-selector flow does, minus the UI clicks.

**To jump straight to the end-results screen** (e.g. to reproduce a mobile layout bug in `SummaryPage`/`EndResultScreen` without playing 10+ turns): after seeding, directly patch the persisted campaign state in `localStorage` and merge in `isEnded: true` plus a `results: CalculateResults`-shaped object (see `shared/types/campaign.ts` for `CalculateResults`/`Mandate`), then navigate to `/game/<id>/end-results?sessionId=<sessionId>`:

```js
const key = `kampanykorut_campaignState-${sessionId}`;
const current = JSON.parse(localStorage.getItem(key));
localStorage.setItem(
  key,
  JSON.stringify({
    ...current,
    isEnded: true,
    results: {
      totals: { candidateListResults: {}, partyListResults: {} },
      percentages: {
        candidateListResults: {},
        partyListResults: { _other: 0.02 },
      },
      constituencySeats: {},
      listSeats: {},
      compensation: { losingVotes: {}, winnerCompensation: {}, total: {} },
      mandates: [
        {
          party: "tisza",
          constituencySeats: 60,
          listSeats: 45,
          totalSeats: 105,
        },
        {
          party: "fidesz",
          constituencySeats: 40,
          listSeats: 35,
          totalSeats: 75,
        },
      ],
    },
  }),
);
```

`campaignId` values live in `apps/kampanykorut/public/assets/jsons/game_modes.json` (the `id` field — the folder name under `public/campaigns/` is the separate `route` field). `playerSide` party/candidate ids come from that campaign's `election_config.json` → `playableSides`.

### Driving this from Playwright for visual/layout bugs

`playwright` is installed at the repo root (`node_modules/playwright`), independent of the `yarn playwright` e2e suite — usable as a plain Node script for one-off repros:

```js
const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 700 } }); // mobile
await page.goto("http://localhost:3000/menu");
await page.waitForFunction(() => !!window.kampanykorut);
// ...seedCampaign + localStorage patch as above, then page.goto the target route
```

Useful checks for "layout doesn't fill the screen" / "can scroll where it shouldn't" bugs — don't just eyeball a screenshot, measure:

```js
await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth, // > innerWidth ⇒ horizontal overflow
  scrollHeight: document.documentElement.scrollHeight, // > innerHeight ⇒ page is scrolling when it shouldn't
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
}));
```

To find _which_ element causes an overflow, walk the ancestor chain of the suspect node with `getBoundingClientRect()` — the element whose `right`/`bottom` exceeds the viewport (while its parents don't) is the culprit.

**Recurring mobile-layout bug patterns found in this codebase** (both fixed the same way conceptually — a fixed CSS dimension that isn't re-guarded for the mobile breakpoint):

- **Fixed-height chain not filling the screen, or overflowing past it, on mobile**: a `<main>`/wrapper sets `h-full`, but a plain block descendant several levels down has no height at all (auto/content-based) — CSS percentage heights don't magically propagate through intermediate `<div>`s. Fix: make the ancestor a flex column (`flex flex-col`) and give the descendant that should fill it `flex-1 min-h-0` (and, on the innermost scrollable content div, keep/add `overflow-y-auto`) so it either fills the available height or scrolls _inside_ the box instead of pushing the whole page. Cancel this on desktop with `md:flex-none` if desktop already relies on a fixed pixel height (e.g. `md:h-[620px]`).
- **Horizontal overflow from an absolutely-positioned element with a bare fixed pixel width** (e.g. `w-[650px]`, no `md:` guard): on a narrow viewport this pushes `document.documentElement.scrollWidth` past `innerWidth`, causing a horizontal scrollbar and a "doesn't fill the screen" gap. Fix: `w-full md:w-[650px]`, or if the element is desktop-only content, `hidden md:flex` on the wrapper entirely.

---

## Campaign Data Structure (`apps/kampanykorut/public/`)

### Campaign Registry

```
apps/kampanykorut/public/assets/jsons/game_modes.json   # List of available campaigns (id, label, route, tags, banner, isPublished)
apps/kampanykorut/public/assets/jsons/quotes.json       # Loading screen quotes
```

The `route` field in `game_modes.json` maps to the folder name under `public/campaigns/`; the `id` field is what code (routes, `seedCampaign`, `loadCampaignConfig`) actually addresses the campaign by. They are often similar but not identical (e.g. id `2026_tavaszi_szel` vs. route `2026_tavaszi-szel`) — don't assume one from the other.

### Campaign Folders

```
apps/kampanykorut/public/campaigns/{route}/
  manifest.json                 # CampaignManifest field -> relative JSON file path (drives loadCampaignConfig)
  election_config.json          # Parties, total seats, list seats, threshold %, playable sides
  voter_environment_config.json # Eligible voters, max turnout, list data
  oevk_{year}.json               # OEVK district-level candidate and vote data
  oevk_constituency_results.json# Single-member district results
  oevk_list_results.json        # Party list results
  budapest.json                 # Budapest district map (GeoJSON-like polygon data)
  custom_groups.json            # Custom coalition groupings
  custom_pollsters.json         # Optional campaign-specific pollster definitions
  end_results.json              # Fallback end-game images/text; per-candidate override lives at {side}/{candidate}/end_results.json

  {side}/{candidate}/           # Playable side + candidate (e.g. "tisza/magyar_peter"), referenced from manifest.json
    {year}_questions.json              # Campaign questions (id, title, question, possibleAnswers)
    {year}_answer_effects.json         # Per-answer effects (RawEffect array)
    {year}_campaign_strategies.json    # Optional end-of-game strategy rewards
    advisor_feedback.json              # Advisor feedback texts
    advisor_feedback_assets.json       # Advisor feedback image assets
    end_results.json                   # playerSideVictory / playerSideDefeat / deadlock: title, subtitle, description, imageUri
```

`manifest.json`'s keys are the `CampaignManifest` fields (`shared/types/configs/campaign-manifest.ts`); values are paths relative to the campaign folder — filenames and nesting under `{side}/{candidate}/` are just convention, `loadCampaignConfig` only cares about the manifest. `electionConfig`, `voterEnvironmentConfig`, `candidateListData`, `districts`, `endResults` are required; everything else (`questions`, `answerEffect`, `partyListData`, `advisorFeedback`, `advisorFeedbackAssets`, `customGroups`, `customPollsters`, `campaignStrategies`) is optional and defaults to an empty array/undefined when omitted — this is what lets an unpublished campaign (`isPublished: false` in `game_modes.json`) be built up incrementally with no code changes: just JSON data + `manifest.json` in the folder, plus an entry in `game_modes.json`.

---

## Domain Layer (`shared/domain/`)

| Module                    | Responsibility                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `CampaignEngine`          | Orchestrates game turns: applies decisions, triggers recalculation                   |
| `MandateCalculator`       | Vote share → parliamentary seats (proportional + OEVK + compensation)                |
| `EffectApplier`           | Translates `RawEffect` objects into mutations on electoral data                      |
| `ResultModifier`          | Composes the transformer pipeline (transformers live in `ResultTransformer/`)        |
| `ResultTransformer/`      | `VoteShareTransformer`, `UnionSwingTransformer`, `DistrictVoteTransformer`, etc.     |
| `VoterEnvironment`        | Turnout model (eligible voters → actual votes cast)                                  |
| `DistrictGroupEngine`     | District grouping and filtering                                                      |
| `PollsterEngine`          | Manages `Pollster` configs (bias/error margin), produces aggregate polling opinions  |
| `DefaultGroups.ts`        | Built-in district groups (e.g. `nyugati_megyek`, `keleti_megyek`)                    |
| `DefaultPollsters.ts`     | Built-in pollster definitions (e.g. "Medián")                                        |
| `ResultModifier.utils.ts` | Shared helpers (e.g. `calcPercentages`) used by `MandateCalculator`/`ResultModifier` |

`shared/domain/mocks/` — mock data for tests; do not modify outside of test context.

---

## Application Layer (`apps/kampanykorut/src/logic/application/`)

### Core Classes and Utilities

| File                             | Responsibility                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `Emitter.ts` / `EventEmitter.ts` | Generic pub-sub base classes (protected `notify()`, public `subscribe()`)                      |
| `StorageEngine.ts`               | localStorage abstraction with prefixed keys (`kampanykorut_<key>[-<suffix>]`)                  |
| `StateEngine.ts`                 | Game session persistence to localStorage (campaignState + turnHistory)                         |
| `StateHandler.ts`                | Game state event emitter (`@singleton`)                                                        |
| `SettingsEngine.ts`              | Game settings persistence to localStorage                                                      |
| `ConfigEngine.ts`                | Campaign config loading and caching (in-memory + localStorage)                                 |
| `AssetService.ts`                | Asset URL resolution                                                                           |
| `IdGenerator.ts`                 | Unique session ID generation                                                                   |
| `PathResolver.ts`                | JSON file path resolution from campaign route + key                                            |
| `fetchJSON.ts`                   | JSON fetching from the `public/` folder                                                        |
| `loadCampaignConfig.ts`          | Fetches a campaign's `manifest.json` + referenced files, caches the assembled `CampaignConfig` |
| `getCampaignHeaderById.ts`       | Resolves a campaign id to its `game_modes.json` header (route, label, ...)                     |
| `createCampaignEngine.ts`        | Factory: wires domain objects together via DI                                                  |

### Hooks (`hooks/`)

| Hook               | Responsibility                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| `useElectionState` | Primary hook: game state ↔ UI (processAnswer, commitTurn)                                                   |
| `useStateEngine`   | Session management (sessionId, saveSession, currentState)                                                   |
| `useSettings`      | Reading and updating game settings                                                                          |
| `useStateHandler`  | Binds StateHandler singleton events to React state                                                          |
| `useEngine`        | Generic DI resolver: `container.resolve(cls)`                                                               |
| `useGetCampaigns`  | Loads `game_modes.json` headers; filters out `isPublished: false` entries unless `window.debugMode.enabled` |

### Navigation (`navigation/`)

`NavigationService` + `NavigationBinder` + `Navigation` — React Router abstraction; navigation is injectable via DI.

---

## Domain Rules (inviolable invariants)

1. **Vote Preservation**: Vote shares must always sum to exactly 1.0.
2. **Mass Conservation**: Effects must not increase or decrease total electoral mass.
3. **Delta Equilibrium**: Vote redistribution must balance: ΣDelta ≈ 0.
4. **Domain Purity**: `shared/domain/` contains zero React imports and no side effects.

---

## DI System

**tsyringe** dependency injection, container assembled in `apps/kampanykorut/src/di/container.ts`. `reflect-metadata` must be imported before any DI-annotated class is instantiated.

- `main.tsx` and `apps/kampanykorut/src/test/setup.ts` handle this
- `@singleton()` classes exist as a single instance for the entire application lifecycle
- In tests: `container.resolve(SomeEngine)` returns the same instance the hooks use

---

## Testing Rules

### Basics

- Test files: `**/*.test.ts` (never `.tsx`)
- Vitest `globals: true` — `describe`, `it`, `expect`, `beforeEach`, `afterEach`, `beforeAll`, `afterAll` are globals; no import needed
- `vi` must be imported explicitly: `import { vi } from "vitest"`
- `apps/kampanykorut/src/test/setup.ts` imports `reflect-metadata` — do not import it manually in test files
- Root `yarn test` runs Vitest with `apps/kampanykorut/vite.config.ts`; `apps/campaign-maker` currently has no test suite of its own

### Domain Tests (`shared/domain/`)

- Pure function tests, no mocks
- Every transformer must cover:
  - happy path (normal case)
  - zero-delta case (the effect changes nothing)
  - edge redistribution (boundary redistribution case)
- Snapshots for complex objects

### Application Layer Tests

**Singleton spy pattern** (for hooks and singleton-dependent code):

```ts
import { container } from "tsyringe";
import { SomeEngine } from "../SomeEngine";

let engine: SomeEngine;

beforeEach(() => {
  engine = container.resolve(SomeEngine);
  vi.spyOn(engine, "someMethod").mockReturnValue(fakeValue);
});

afterEach(() => {
  vi.restoreAllMocks(); // required — otherwise spies leak into other tests
});
```

**Hook tests**:

```ts
import { renderHook, act } from "@testing-library/react";

// Hooks that use useNavigate() need a wrapper:
const { result } = renderHook(() => useMyHook(), { wrapper: MemoryRouter });

// Trigger state changes:
act(() => {
  result.current.someAction();
});
```

**Preventing localStorage contamination** — if a test causes a write to localStorage (e.g. via `StateEngine` singleton during `commitTurn`), subsequent tests in the same file will read that persisted state. Fix:

```ts
afterEach(() => {
  localStorage.clear();
});
```

**Testing protected methods** — if a class has a `protected notify()`, expose it via a test subclass:

```ts
class TestEmitter<T> extends Emitter<T> {
  emit(event: T) {
    this.notify(event);
  }
}
```

**`vi.mock` limitations** — if a module is loaded during `setup.ts` execution (e.g. `i18n.ts` resolves `StorageEngine` at module level), `vi.mock` cannot intercept its calls. In that case, assert on observable side effects (e.g. what was written to storage) rather than internal calls.

**DI singleton state between test files** — singleton instances live for the entire test run. If you mutate their state, clean up: `vi.restoreAllMocks()`, `localStorage.clear()`.

**Mock campaign config** — when testing `useElectionState`/`useSideSelectorMenu`, seed the `ConfigEngine` singleton directly instead of hitting the network-backed `loadCampaignConfig`:

```ts
const configEngine = container.resolve(ConfigEngine);

beforeAll(() => {
  configEngine.configure(mockConfig, MOCK_ID, true);
});
afterAll(() => {
  configEngine.configure(null, undefined, true);
});
```

The `forced: true` flag is required — `ConfigEngine.configure` no-ops once it has been configured once in the process.

### What NOT to test

- TypeScript-only structure (e.g. whether a property exists) — the compiler handles this
- Implementation details that can change without affecting observable behavior

---

## General Coding Rules

- **Comments**: only when the WHY is non-obvious. Never describe what the code does or reference the current task/fix.
- **Error handling**: only at system boundaries (user input, external APIs). Do not guard against impossible states in internal code.
- **Feature flags / backwards-compat shims**: do not add them when you can simply change the code.
- **React performance**: wrap heavy components in `React.memo`; do not create objects or arrays inside render functions; use stable keys in lists.
- **Delete, don't comment out**: if something is genuinely unused, delete it — don't leave it commented or prefixed with `_`.
- **Mobile layout changes**: this codebase has a recurring habit of fixed pixel dimensions (`h-full`, `w-[Npx]`) without a `md:` guard, which look fine on desktop but break on mobile (horizontal overflow, or a background that doesn't fill/overflows the screen). When touching a component with a `md:` breakpoint split, check the _un-prefixed_ (mobile) classes just as carefully as the `md:` ones, and verify with the Playwright viewport-measurement technique above rather than by inspection alone.
