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
- 📦 npm or yarn

### Installation

```bash
npm install
```

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

Starts Vite dev server with HMR at http://localhost:5173

### Build

```bash
yarn build:kampanykorut # Build Kampánykörút
yarn build:cmaker # Build Campain maker
```

Compiles TypeScript and optimizes with Vite.

### Testing

```bash
yarn test           # Run unit tests (Vitest, watch modee)
yarn playwright      # Playwright e2e tests, UI mode
yarn playwright_headed # Playwright headed mode
yarn playwright:ct   # Playwright component tests, UI mode
```

### Code Quality

```bash
npm run lint          # Check for linting issues
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
npm run format:check  # Check formatting without changes
```

### Component Explorer (Ladle)

```bash
yarn ladle  # Start Ladle dev server at http://localhost:6006
```

## 📄 License

All rights reserved — see [LICENSE](./LICENSE).
