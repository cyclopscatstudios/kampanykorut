# Kampánykörút – Election Simulation Game

An interactive election simulation game built with React and TypeScript. Players make strategic policy decisions that dynamically affect election results, candidate demographics, and party support across Hungarian electoral districts.

## Overview

**Kampánykörút** (Campaign Circuit) is a domain-driven, fully-typed election simulation game where:

- Players make decisions during campaign turns
- Each decision applies effects to electoral data (vote shares, candidate lists, demographics)
- Results are calculated in real-time using deterministic mandate algorithms
- Supports 2022 and 2024 Hungarian election data and configurations

## Tech Stack

- **Frontend**: React 19.2 + TypeScript 5
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest + @testing-library/react
- **State Management**: tsyringe (dependency injection)
- **Code Quality**: ESLint, Prettier, Husky

## Project Architecture

Following domain-driven design principles with strict separation of concerns:

```
src/
├── logic/
│   ├── domain/              # Pure business logic (no React)
│   │   ├── CampaignEngine   # Main game orchestrator
│   │   ├── ElectionEngine   # Vote & mandate calculations
│   │   ├── EffectApplier    # Applies policy effects to data
│   │   └── MandateCalculator # Converts votes to seats
│   ├── application/         # Orchestration & state management
│   │   ├── StateEngine      # Game state machine
│   │   ├── GameLoaderEngine # Campaign setup & initialization
│   │   └── StorageEngine    # Persistent data management
│   └── hooks/               # Custom React hooks
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── gameplay/        # Game-specific UI
│   │   ├── menu/            # Menu screens
│   │   └── icons/           # Bootstrap icon components
│   ├── DistrictMap/         # Electoral district visualization
│   └── ui/                  # Core UI (Button, Text, RadioGroup, etc.)
├── assets/
│   ├── jsons/               # Game configuration & data
│   │   ├── 2022/           # 2022 election data & configs
│   │   ├── 2024/           # 2024 election data & configs
│   │   ├── game_modes.json # Game mode definitions
│   │   └── quotes.ts       # Game quotes/narrative
└── types/                   # Shared TypeScript types
```

## Core Invariants

The domain enforces strict constraints:

1. **Vote Preservation**: Vote shares must sum to 1.0
2. **Mass Conservation**: Effects must preserve total electoral mass
3. **Delta Equilibrium**: Vote redistribution must balance (DeltaSum ≈ 0)
4. **Domain Purity**: No React imports or side effects in `/domain`

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts Vite dev server with HMR at http://localhost:5173

### Build

```bash
npm run build
```

Compiles TypeScript and optimizes with Vite.

### Testing

```bash
npm run test          # Run tests in watch mode
npm run test:ui       # Run tests with UI
```

### Code Quality

```bash
npm run lint          # Check for linting issues
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
npm run format:check  # Check formatting without changes
```

### Storybook

```bash
npm run storybook        # Start Storybook dev server
npm run build-storybook  # Build static Storybook
```

## Game Mechanics

### Campaign Engine

The `CampaignEngine` orchestrates gameplay:

- Manages game state across turns
- Applies player decisions to electoral data
- Calculates mandate results after each decision
- Integrates with effect systems and calculators

### Decision Effects

Player decisions trigger `RawEffect` objects that modify:

- **Candidate lists**: Demographics, qualifications, recognition
- **Party data**: Vote shares, supporter energy, momentum
- **Electoral dynamics**: Redistribution between parties and districts

### Result Calculation

The `MandateCalculator` converts vote shares to parliamentary seats using Hungarian electoral rules:

- Proportional representation system
- Single-mandate district voting
- Compensation list allocation

## Data Formats

### Election Configuration

Located in `src/assets/jsons/{year}/`:

- `oevk_*.json` - District boundary and electoral data
- `election_config.json` - Election-specific rules and parameters
- `game_modes.json` - Available campaign scenarios

### Internationalization

Supports multiple languages:

- `en_lang.json` - English
- `hu_lang.json` - Hungarian

## JSON Examples

yearOfElection_questions.json

[
{
"id": "yearOfElection_electionName-questionNumber",
"title": "Title example",
"question": "Question description",
"affects": [
{
"id": "yearOfElection_electionName-questionNumber"
}
],
"requires": [{ "questionId": "yearOfElection_electionName-questionNumber", "answerId": "id" }],
"blocks": [{ "questionId": "yearOfElection_electionName-questionNumber", "answerId": "id" }],
"possibleAnswers": [
{
"id": "id",
"label": "Answer description"
}
]
}
]

## Performance Considerations

- Heavy components are memoized to prevent unnecessary re-renders
- Objects are created outside render functions when possible
- Stable keys used in lists to optimize reconciliation
- Domain logic executes synchronously for deterministic results

## Testing Strategy

Every transformer and calculator includes tests for:

- Happy path (normal operation)
- Zero-delta case (no effect)
- Edge redistribution cases (boundary conditions)

## Contributing

This project follows strict architectural guidelines:

- Domain logic must remain pure and deterministic
- UI components should not contain calculation logic
- All game rules are enforced via domain invariants
- Tests should validate both happy paths and edge cases

## License

[Add your license here]
