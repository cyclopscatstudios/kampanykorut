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
npm run storybook     # Storybook: port 6006
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
src/dev/               → Dev-only screens, accessible at /dev route.
```

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
  election_config.json          # Parties, total seats, list seats, threshold %, playable sides
  voter_environment_config.json # Eligible voters, max turnout, list data
  oevk_{year}.json              # OEVK district-level candidate and vote data
  oevk_constituency_results.json# Single-member district results
  oevk_list_results.json        # Party list results
  budapest.json                 # Budapest district map (GeoJSON-like polygon data)
  custom_groups.json            # Custom coalition groupings
  end_results.json              # End-game images and text (victory/defeat)

  {side}/                       # Playable side (e.g. "ellenzeki_osszefogas")
    questions.json              # Campaign questions (id, title, question, possibleAnswers)
    answer_effects.json         # Per-answer effects (RawEffect array)
    advisor_feedback.json       # Advisor feedback texts
    advisor_feedback_assets.json# Advisor feedback image assets
```

> **Future plan:** `public/campaigns/_0001_/` is a placeholder for user-created campaigns.

---

## Domain Layer (`shared/domain/`)

| Module | Responsibility |
|--------|---------------|
| `CampaignEngine` | Orchestrates game turns: applies decisions, triggers recalculation |
| `MandateCalculator` | Vote share → parliamentary seats (proportional + OEVK + compensation) |
| `EffectApplier` | Translates `RawEffect` objects into mutations on electoral data |
| `ResultModifier` | Composes the transformer pipeline |
| `VoteShareTransformer` | Party list vote share redistribution |
| `UnionSwingTransformer` | Coalition overlap-based swing redistribution |
| `DistrictVoteTransformer` | OEVK district-level vote redistribution |
| `VoterEnvironment` | Turnout model (eligible voters → actual votes cast) |
| `DistrictGroupEngine` | District grouping and filtering |

`shared/domain/mocks/` — mock data for tests; do not modify outside of test context.

---

## Application Layer (`src/logic/application/`)

### Core Classes and Utilities

| File | Responsibility |
|------|---------------|
| `Emitter.ts` | Generic pub-sub base class (protected `notify()`, public `subscribe()`) |
| `StorageEngine.ts` | localStorage abstraction with prefixed keys |
| `StateEngine.ts` | Game session persistence to localStorage (campaignState + turnHistory) |
| `StateHandler.ts` | Game state event emitter (`@singleton`) |
| `SettingsEngine.ts` | Game settings persistence to localStorage |
| `ConfigEngine.ts` | Campaign config loading and caching to localStorage |
| `AssetService.ts` | Asset URL resolution |
| `IdGenerator.ts` | Unique session ID generation |
| `PathResolver.ts` | JSON file path resolution from campaign route + key |
| `fetchJSON.ts` | JSON fetching from the `public/` folder |
| `gameModeRegistery.ts` | In-memory campaign registry (populated at startup) |
| `createCampaignEngine.ts` | Factory: wires domain objects together via DI |

### Hooks (`hooks/`)

| Hook | Responsibility |
|------|---------------|
| `useElectionState` | Primary hook: game state ↔ UI (processAnswer, commitTurn) |
| `useStateEngine` | Session management (sessionId, saveSession, currentState) |
| `useSettings` | Reading and updating game settings |
| `useStateHandler` | Binds StateHandler singleton events to React state |
| `useEngine` | CampaignEngine hook |
| `useGetCampaigns` | Loads available campaigns |

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
act(() => { result.current.someAction(); });
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
  emit(event: T) { this.notify(event); }
}
```

**`vi.mock` limitations** — if a module is loaded during `setup.ts` execution (e.g. `i18n.ts` resolves `StorageEngine` at module level), `vi.mock` cannot intercept its calls. In that case, assert on observable side effects (e.g. what was written to storage) rather than internal calls.

**DI singleton state between test files** — singleton instances live for the entire test run. If you mutate their state, clean up: `vi.restoreAllMocks()`, `localStorage.clear()`.

**gameModeRegistry mock campaign** — when testing `useElectionState`, register a mock campaign:

```ts
beforeAll(() => { gameModeRegistry[MOCK_ID] = mockConfig; });
afterAll(() => { delete (gameModeRegistry as Record<string, unknown>)[MOCK_ID]; });
```

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
