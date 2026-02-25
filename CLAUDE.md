# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start Vite dev server at http://localhost:5173
npm run build         # TypeScript compile + Vite production build
npm run test          # Run tests in watch mode (Vitest)
npm run lint          # Check ESLint issues
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Format with Prettier
npm run format:check  # Check formatting without changes
npm run storybook     # Launch Storybook at port 6006
```

To run a single test file:

```bash
npx vitest run src/path/to/file.test.ts
```

## Architecture

**Kampánykörút** is a domain-driven Hungarian election simulation game. Players make policy decisions that affect vote shares across electoral districts; results are calculated deterministically using real electoral rules.

### Layer Boundaries (strictly enforced)

```
src/logic/domain/      → Pure, deterministic business logic. Zero React imports.
src/logic/application/ → Orchestrates domain. Hooks, state machines, persistence.
src/components/        → React UI only. No calculation logic.
src/assets/jsons/      → JSON election data (2022, 2024 election years).
src/dev/               → Dev-only screens, accessible at /dev route.
```

### Key Domain Modules

- **`CampaignEngine`** – Orchestrates game turns, applies decisions, triggers recalculation.
- **`MandateCalculator`** – Converts vote shares to parliamentary seats (Hungarian electoral rules: proportional + single-mandate districts + compensation lists).
- **`EffectApplier`** – Translates `RawEffect` objects from player decisions into mutations on electoral data.
- **`ResultModifier` / `*Transformer`** – Composes vote redistribution logic; `VoteShareTransformer`, `UnionSwingTransformer`, `DistrictVoteTransformer` each handle a redistribution strategy.

### Application Layer

- **`createCampaignEngine`** – Factory that wires domain objects together.
- **`StateHandler`** – Event emitter for game state changes (tsyringe `@singleton`).
- **`StateEngine`** – Load/save game sessions to localStorage.
- **`AppStateMachine`** – Manages menu navigation flow.
- **`useElectionState`** – Primary React hook connecting game state to UI.

### Entry Points

- `index.html` → `src/main.tsx` → `<App />` (or `<DevApp />` at `/dev` path)
- `App.tsx` routes between `MenuSelector` (game selection) and `MainGameScreen` (gameplay)

## Core Invariants

These domain rules must never be violated:

1. **Vote Preservation**: Vote shares must always sum to 1.0.
2. **Mass Conservation**: Effects must not increase or decrease total electoral mass.
3. **Delta Equilibrium**: Vote redistribution must balance (ΣDelta ≈ 0).
4. **Domain Purity**: `/domain` contains zero React imports and no side effects.

## Testing

- Test files match `**/*.test.ts` (not `.tsx`).
- Tests use Vitest with `globals: true`; no import needed for `describe`/`it`/`expect`.
- `src/test/setup.ts` imports `reflect-metadata` (required for tsyringe DI).
- Domain tests are pure function tests — no mocks.
- Every transformer must cover: happy path, zero-delta case, and edge redistribution case.
- Snapshots are used for complex object validation.

## DI System

Uses **tsyringe** for dependency injection. `reflect-metadata` must be imported before any DI-decorated class is instantiated — this is handled in `main.tsx` and `test/setup.ts`.

## Performance Rules

- Heavy components must be wrapped with `React.memo`.
- Avoid creating objects/arrays inside render functions.
- Use stable keys in lists.
