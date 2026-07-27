# Kampánykörút – Agent Guide

## What is this application?

**Kampánykörút** is a domain-driven Hungarian election simulation game. The player makes policy decisions that deterministically affect party vote shares and seat distributions according to the real Hungarian electoral system (OEVK single-member districts + party lists + compensation lists).

Tech stack: React + TypeScript, Vite, Vitest, tsyringe DI, Tailwind CSS.

---

## Commands

```bash
npm run dev           # Vite dev server: http://localhost:5173
npm run build         # TypeScript compile + production build
npm run test          # Run tests in watch mode (Vitest)
npm run lint          # Check ESLint issues
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Format with Prettier
npm run format:check  # Check formatting without changes
npm run ladle         # Ladle: port 6006
```

Run a single test file:

```bash
npx vitest run src/path/to/file.test.ts
```

---

## Layer Boundaries (strictly enforced)

```
shared/domain/         → Pure, deterministic business logic. Zero React imports.
shared/types/          → TypeScript type definitions. No logic, no React.
shared/logger/         → Logger utility.
src/logic/application/ → Domain orchestration: hooks, state machine, persistence, DI.
src/components/        → React UI only. No calculation logic.
src/debug/             → Runtime debug-mode toggle (window.debugMode), wired up in main.tsx.
```

There is no dedicated dev-only route. Unpublished campaigns (`isPublished: false` in `game_modes.json`) are hidden from the campaign selector unless `window.debugMode.enabled` is toggled on from the browser console.

**Forbidden crossings:**

- `shared/domain/` must not import from `src/`
- `src/components/` must not contain calculation logic
- `src/logic/domain/` does not exist — domain lives in the `shared/` package

---

## Campaign Data Structure (`public/`)

### Campaign Registry

```
public/assets/jsons/game_modes.json   # List of available campaigns (id, label, route, tags, banner)
public/assets/jsons/quotes.json       # Loading screen quotes
```

The `route` field in `game_modes.json` maps to the folder name under `public/campaigns/`.

### Campaign Folders

```
public/campaigns/{route}/
  manifest.json                 # CampaignManifest field -> relative JSON file path (drives loadCampaignConfig)
  election_config.json          # Parties, total seats, list seats, threshold %, playable sides
  voter_environment_config.json # Eligible voters, max turnout, list data
  oevk_{year}.json              # OEVK district-level candidate and vote data
  oevk_constituency_results.json# Single-member district results
  oevk_list_results.json        # Party list results
  budapest.json                 # Budapest district map (GeoJSON-like polygon data)
  custom_groups.json            # Custom coalition groupings
  custom_pollsters.json         # Optional campaign-specific pollster definitions
  end_results.json              # End-game images and text (victory/defeat)

  {side}/                       # Playable side (e.g. "ellenzeki_osszefogas"), referenced from manifest.json
    {year}_questions.json              # Campaign questions (id, title, question, possibleAnswers)
    {year}_answer_effects.json         # Per-answer effects (RawEffect array)
    {year}_campaign_strategies.json    # Optional end-of-game strategy rewards
    advisor_feedback.json              # Advisor feedback texts
    advisor_feedback_assets.json       # Advisor feedback image assets
```

`manifest.json`'s keys are the `CampaignManifest` fields (`shared/types/configs/campaign-manifest.ts`); values are paths relative to the campaign folder — filenames and nesting under `{side}/` are just convention, `loadCampaignConfig` only cares about the manifest. `electionConfig`, `voterEnvironmentConfig`, `candidateListData`, `districts`, `endResults` are required; everything else (`questions`, `answerEffect`, `partyListData`, `advisorFeedback`, `advisorFeedbackAssets`, `customGroups`, `customPollsters`, `campaignStrategies`) is optional and defaults to an empty array/undefined when omitted — this is what lets an unpublished campaign (`isPublished: false` in `game_modes.json`) be built up incrementally with no code changes: just JSON data + `manifest.json` in the folder, plus an entry in `game_modes.json`.

---

## Domain Layer (`shared/domain/`)

| Module                    | Responsibility                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `CampaignEngine`          | Orchestrates game turns: applies decisions, triggers recalculation                   |
| `MandateCalculator`       | Vote share → parliamentary seats (proportional + OEVK + compensation)                |
| `EffectApplier`           | Translates `RawEffect` objects into mutations on electoral data                      |
| `ResultModifier`          | Composes the transformer pipeline                                                    |
| `VoteShareTransformer`    | Party list vote share redistribution                                                 |
| `UnionSwingTransformer`   | Coalition overlap-based swing redistribution                                         |
| `DistrictVoteTransformer` | OEVK district-level vote redistribution                                              |
| `VoterEnvironment`        | Turnout model (eligible voters → actual votes cast)                                  |
| `DistrictGroupEngine`     | District grouping and filtering                                                      |
| `PollsterEngine`          | Manages `Pollster` configs (bias/error margin), produces aggregate polling opinions  |
| `DefaultGroups.ts`        | Built-in district groups (e.g. `nyugati_megyek`, `keleti_megyek`)                    |
| `DefaultPollsters.ts`     | Built-in pollster definitions (e.g. "Medián")                                        |
| `ResultModifier.utils.ts` | Shared helpers (e.g. `calcPercentages`) used by `MandateCalculator`/`ResultModifier` |

`shared/domain/mocks/` — mock data for tests; do not modify outside of test context.

---

## Application Layer (`src/logic/application/`)

### Core Classes and Utilities

| File                       | Responsibility                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `Emitter.ts`               | Generic pub-sub base class (protected `notify()`, public `subscribe()`)                        |
| `StorageEngine.ts`         | localStorage abstraction with prefixed keys                                                    |
| `StateEngine.ts`           | Game session persistence to localStorage (campaignState + turnHistory)                         |
| `StateHandler.ts`          | Game state event emitter (`@singleton`)                                                        |
| `SettingsEngine.ts`        | Game settings persistence to localStorage                                                      |
| `ConfigEngine.ts`          | Campaign config loading and caching to localStorage                                            |
| `AssetService.ts`          | Asset URL resolution                                                                           |
| `IdGenerator.ts`           | Unique session ID generation                                                                   |
| `PathResolver.ts`          | JSON file path resolution from campaign route + key                                            |
| `fetchJSON.ts`             | JSON fetching from the `public/` folder                                                        |
| `loadCampaignConfig.ts`    | Fetches a campaign's `manifest.json` + referenced files, caches the assembled `CampaignConfig` |
| `getCampaignHeaderById.ts` | Resolves a campaign id to its `game_modes.json` header (route, label, ...)                     |
| `createCampaignEngine.ts`  | Factory: wires domain objects together via DI                                                  |

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

**tsyringe** dependency injection. `reflect-metadata` must be imported before any DI-annotated class is instantiated.

- `main.tsx` and `src/test/setup.ts` handle this
- `@singleton()` classes exist as a single instance for the entire application lifecycle
- In tests: `container.resolve(SomeEngine)` returns the same instance the hooks use

---

## Testing Rules

### Basics

- Test files: `**/*.test.ts` (never `.tsx`)
- Vitest `globals: true` — `describe`, `it`, `expect`, `beforeEach`, `afterEach`, `beforeAll`, `afterAll` are globals; no import needed
- `vi` must be imported explicitly: `import { vi } from "vitest"`
- `src/test/setup.ts` imports `reflect-metadata` — do not import it manually in test files

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
