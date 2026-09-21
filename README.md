# Kampánykörút

<p align="center">
  <img src="apps/kampanykorut/public/kampanykorut-demo.gif" width="900" alt="Gameplay preview">
</p>

An interactive election simulation game built with React and TypeScript. Players make strategic policy decisions that dynamically affect election results, candidate demographics, and party support across Hungarian electoral districts.

## 🗳️ Overview

**Kampánykörút** is a domain-driven, fully-typed election simulation game where:

- 🎯 Players make decisions during campaign turns
- ⚡ Each decision applies effects to electoral data (vote shares, candidate lists, demographics)
- 📊 Results are calculated in real-time using deterministic mandate algorithms

## 🛠️ Tech Stack

- ⚛️ **Frontend**: React 19.2 + TypeScript 5
- ⚡ **Build Tool**: Vite 7
- 🎨 **Styling**: Tailwind CSS 4
- 🧪 **Testing**: Vitest + @testing-library/react, Playwright (e2e & component tests)
- 📖 **Component Explorer**: Ladle
- 🧩 **State Management**: tsyringe (dependency injection)
- ✅ **Code Quality**: ESLint, Prettier, Husky

## 🔒 Core Invariants

The domain enforces strict constraints:

1. **Vote Preservation**: Vote shares must sum to 1.0
2. **Mass Conservation**: Effects must preserve total electoral mass
3. **Delta Equilibrium**: Vote redistribution must balance (DeltaSum ≈ 0)
4. **Domain Purity**: No React imports or side effects in `/domain`

## 🚀 Getting Started

### Prerequisites

- 🟢 Node.js 18+
- 📦 Yarn Classic (`corepack enable` — pinned via `packageManager` in the root `package.json`)

## Apps

Yarn (Classic v1) workspaces monorepo.

- [`apps/kampanykorut`](apps/kampanykorut) — the Kampánykörút election simulation game (see its README for details).
- [`apps/campaign-maker`](apps/campaign-maker) — campaign authoring tool (new, minimal scaffold).

### Development

```bash
corepack enable        # ensures Yarn Classic 1.22.x is used (see root package.json "packageManager")
yarn install            # installs all workspaces from the repo root

yarn kampanykorut      # http://localhost:3000
yarn cmaker            # http://localhost:3001
```

Starts the Vite dev server with HMR.

### Build

```bash
yarn build:kampanykorut # Build Kampánykörút
yarn build:cmaker # Build Campaign Maker
```

Compiles TypeScript and optimizes with Vite.

### Testing

```bash
yarn test             # Run unit tests (Vitest, watch mode)
yarn playwright       # Playwright e2e tests, UI mode
yarn playwright:headed # Playwright e2e tests, UI mode + headed
yarn playwright:ct    # Playwright component tests, UI mode
```

### Code Quality

```bash
yarn lint          # Check for linting issues
yarn lint:fix      # Auto-fix linting issues
yarn format        # Format code with Prettier
yarn format:check  # Check formatting without changes
```

### Component Explorer (Ladle)

```bash
yarn ladle  # Start Ladle dev server at http://localhost:6006
```

## 📄 License

All rights reserved — see [LICENSE](./LICENSE).
