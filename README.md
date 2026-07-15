# Kampánykörút – Election Simulation Game

An interactive election simulation game built with React and TypeScript. Players make strategic policy decisions that dynamically affect election results, candidate demographics, and party support across Hungarian electoral districts.

## Overview

**Kampánykörút** is a domain-driven, fully-typed election simulation game where:

- Players make decisions during campaign turns
- Each decision applies effects to electoral data (vote shares, candidate lists, demographics)
- Results are calculated in real-time using deterministic mandate algorithms

## Tech Stack

- **Frontend**: React 19.2 + TypeScript 5
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest + @testing-library/react, Playwright (e2e & component tests)
- **Component Explorer**: Ladle
- **State Management**: tsyringe (dependency injection)
- **Code Quality**: ESLint, Prettier, Husky

## Project Architecture

Following domain-driven design principles with strict separation of concerns:

```
src/
├── components/
│   ├── DistrictMap/         # SVG electoral map rendering (geometry, projection, coloring)
│   ├── loaders/             # react-router data loaders
│   └── ui/
│       ├── gameplay/        # In-game screens & chrome (GameChrome, TopBar, MapCreator, FinalResultScreen, ...)
│       ├── menu/            # Menu screens (MainMenu, SideSelectorMenu, SettingsMenu, ...)
│       └── icons/           # Icon registry
├── debug/                   # Runtime debug-mode toggle (window.debugMode)
├── di/                      # tsyringe container wiring
├── hooks/                   # Cross-cutting React hooks
├── logic/
│   ├── application/         # Orchestration: engines, hooks, navigation, DI factories
│   ├── i18n/                # i18next setup
│   ├── infra/                # External service clients (Supabase)
│   └── langs/               # Translation files (en, hu)
└── types/                    # App-local TypeScript types

shared/                       # Framework-agnostic package
├── domain/                   # Pure business logic (no React) — engines, transformers, mocks
├── types/                     # Domain TypeScript types + campaign configs
└── logger/                    # Logging utility

public/
├── assets/jsons/             # Global data shared across every campaign (game_modes.json, quotes.json)
└── campaigns/{route}/        # Per-campaign election data & content (see Data Formats below)
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
npm run test           # Run unit tests (Vitest, watch mode)
npm run playwright      # Playwright e2e tests, UI mode
npm run playwright:ct   # Playwright component tests, UI mode
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
npm run ladle  # Start Ladle dev server at http://localhost:6006
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

Game data lives under two top-level folders in `public/`:

- `public/campaigns/{year}/` - election-year data (district results, configuration) plus, per party, the campaign content itself (questions, effects, strategies, advisor feedback)
- `public/assets/jsons/` - global data shared across every campaign

### Election Configuration

Located in `public/campaigns/{year}/`:

- `oevk_{year}.json` - District boundary and electoral data
- `election_config.json` - Election-specific rules and parameters
- `custom_groups.json` - Campaign-specific district groups (see [Campaign Data (JSON)](#campaign-data-json) below)
- `custom_pollsters.json` - Optional campaign-specific pollster definitions (fed into `PollsterEngine`)

Located in `public/assets/jsons/`:

- `game_modes.json` - Available campaign scenarios. Each entry may set `isPublished: false` to hide it from the campaign selector (see [Debug Mode](#debug-mode) below).
- `quotes.json` - Narrative quotes shown during gameplay

### Internationalization

Supports multiple languages, located in `src/logic/langs/`:

- `en_lang.json` - English
- `hu_lang.json` - Hungarian

### Debug Mode

Campaigns with `isPublished: false` in `game_modes.json` are hidden from the campaign selector by default. Toggle visibility at runtime from the browser console:

```js
window.debugMode.toggle();
```

## Campaign Data (JSON)

Each playable campaign lives under `public/campaigns/{year}/{partyId}/` (e.g. `public/campaigns/2022/ellenzeki_osszefogas/`) and is driven turn by turn by a pair of files: a **questions** file and a matching **answer effects** file. This section documents both. Other files in the same folder (`{year}_campaign_strategies.json`, `advisor_feedback.json`, …) follow a similar shape and will be documented separately.

### `{year}_questions.json`

An array of question objects, shown to the player one per turn. Corresponds to the `RawQuestion` type ([shared/types/question.ts](shared/types/question.ts)).

```json
[
  {
    "id": "2022_ogyv-1",
    "title": "Do you accept the joint candidacy?",
    "question": "Question text shown to the player...",
    "possibleAnswers": [
      { "id": "A", "label": "Answer A description" },
      { "id": "B", "label": "Answer B description" },
      { "id": "C", "label": "Answer C description" },
      { "id": "D", "label": "Answer D description" }
    ],
    "affects": [{ "id": "A" }, { "id": "C" }],
    "requires": [{ "questionId": "2022_ogyv-3", "answerId": "A" }],
    "blocks": [{ "questionId": "2022_ogyv-3", "answerId": "A" }]
  }
]
```

| Field             | Required | Type                              | Description                                                                                                                                                                      |
| ----------------- | -------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | yes      | `string`                          | Unique question id. Convention: `{year}_{electionShortName}-{questionNumber}`, e.g. `2022_ogyv-1`.                                                                               |
| `question`        | yes      | `string`                          | The question text shown to the player. ⚠️ Planned to be renamed to `label`; a max character length is not yet defined.                                                           |
| `possibleAnswers` | yes      | `{ id: string, label: string }[]` | The answer options — currently always exactly 4.                                                                                                                                 |
| `title`           | no       | `string`                          | Short topic/category label shown above the question.                                                                                                                             |
| `affects`         | no       | `{ id: string }[]`                | Ids (from `possibleAnswers`) of answers to _this_ question that unlock a `conditionalEffects` block on a _later_ question — see [answer effects](#yearanswer_effectsjson) below. |
| `requires`        | no       | `{ questionId, answerId }[]`      | This question is only shown if the referenced answer was previously selected.                                                                                                    |
| `blocks`          | no       | `{ questionId, answerId }[]`      | This question is hidden/skipped if the referenced answer was previously selected.                                                                                                |

### `{year}_answer_effects.json`

An array with one entry per question, mapping each of its possible answers to the gameplay effects it triggers. Corresponds to `Answer` / `RawAnsweEffectProps` ([shared/types/answer.ts](shared/types/answer.ts), [shared/types/effects.ts](shared/types/effects.ts)).

```json
[
  {
    "id": "2022_ogyv-6",
    "answers": [
      {
        "id": "D",
        "effects": [
          {
            "type": "uniform-swing",
            "params": { "ellenzeki_osszefogas": 0.2, "fidesz": -0.2 }
          }
        ],
        "conditionalEffects": [
          {
            "if": [{ "questionId": "2022_ogyv-3", "answerId": "C" }],
            "mode": "replace",
            "effects": [
              {
                "type": "district-vote-transfer",
                "params": [
                  {
                    "groupId": "billego_korzetek",
                    "targetParty": "ellenzeki_osszefogas",
                    "amount": 1200,
                    "from": { "type": "party", "party": "fidesz" }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]
```

| Field                          | Required | Type                  | Description                                                                                                                                                                                                                                                                                |
| ------------------------------ | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                           | yes      | `string`              | Id of the question this entry belongs to.                                                                                                                                                                                                                                                  |
| `answers`                      | yes      | `Answer[]`            | One entry per answer id, each with `effects` and optionally `conditionalEffects`.                                                                                                                                                                                                          |
| `answers[].effects`            | yes      | `Effect[]`            | Effects applied unconditionally when this answer is chosen.                                                                                                                                                                                                                                |
| `answers[].conditionalEffects` | no       | `ConditionalEffect[]` | Extra effects, applied only if earlier answers match `if`. Each entry is `{ if: { questionId, answerId }[], mode: "merge" \| "replace", effects: Effect[] }`. `merge` appends `effects` to the base list; `replace` discards the base `effects` entirely in favor of the conditional ones. |

#### Effect types

Every `Effect` has the shape `{ type: string, params: ... }`. Four types exist today:

| `type`                   | `params` shape                                                                                                                  | Behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `uniform-swing`          | `Record<partyId, number>`                                                                                                       | Shifts each listed party's national vote share by the given number of percentage points, e.g. `{ "ellenzeki_osszefogas": 2.5, "fidesz": -2.5 }`.                                                                                                                                                                                                                                                                                                                                                                                     |
| `vote-allocation`        | `{ newVotes: number, share: Record<partyId, number> }`                                                                          | Adds `newVotes` brand-new votes to the electorate, distributed across parties according to `share`.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `district-vote-transfer` | `{ groupId: string, targetParty: string, amount: number, from: { type: "party", party: string } \| { type: "bizonytalan" } }[]` | Moves up to `amount` votes to `targetParty` in every district belonging to `groupId`, sourced either from a named rival party or from the `bizonytalan` ("undecided", i.e. not-yet-committed eligible voters) pool. `groupId` refers to a district group defined either in the built-in [`DefaultGroups`](shared/domain/DefaultGroups.ts) (`nagyvarosok`, `billego_korzetek`, `kis_telepulesek`, `vegyes_oevk`, `nyugati_megyek`, `keleti_megyek`, `eszaki_megyek`, `deli_megyek`, …) or in the campaign's own `custom_groups.json`. |
| `turnout-change`         | `Record<partyId, number>`                                                                                                       | Adjusts a party's supporter turnout/motivation. ⚠️ Currently being reworked — not actively used by any shipped answer-effect file yet.                                                                                                                                                                                                                                                                                                                                                                                               |

> **Known inconsistency (TODO):** `params` is an object for `uniform-swing`, `vote-allocation` and `turnout-change`, but an array for `district-vote-transfer`. The plan is to unify every effect type on an array-based `params` shape.

#### Campaign strategies

`{year}_campaign_strategies.json`

Optional. Unlike `answer_effects`, strategies aren't resolved turn by turn — they're evaluated once, right after the last question has been answered: each strategy counts how many of its `conditions` match answers actually given over the course of the game, then applies the effects of the highest-tier `reward` whose `minMatches` threshold is met. Corresponds to the `Strategy` type ([shared/types/strategy.ts](shared/types/strategy.ts)); resolved in `CampaignEngine.applyStrategy` ([shared/domain/CampaignEngine.ts](shared/domain/CampaignEngine.ts)).

```json
[
  {
    "id": "strategy-1",
    "label": "Above the parties",
    "target": {
      "party": "ellenzeki_osszefogas",
      "candidate": "marki_zay_peter"
    },
    "conditions": [
      { "questionId": "2022_ogyv-1", "answerId": "A" },
      { "questionId": "2022_ogyv-7", "answerId": "D" },
      { "questionId": "2022_ogyv-18", "answerId": "B" }
    ],
    "rewards": [
      {
        "minMatches": 3,
        "effects": [
          {
            "type": "uniform-swing",
            "params": {
              "ellenzeki_osszefogas": 2.5,
              "fidesz": -1.5,
              "mkkp": -1
            }
          }
        ]
      }
    ],
    "asset": { "badge": "/images/2022/badge-partok-felett.svg" }
  }
]
```

| Field        | Required | Type                                          | Description                                                                                                                                                        |
| ------------ | -------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`         | yes      | `string`                                      | Unique strategy id.                                                                                                                                                |
| `label`      | yes      | `string`                                      | Display name of the strategy/playstyle, e.g. shown on the reward badge.                                                                                            |
| `target`     | yes      | `{ party: string, candidate: string }`        | The party/candidate this strategy applies to.                                                                                                                      |
| `conditions` | yes      | `{ questionId, answerId }[]`                  | The full set of "ideal" answers for this strategy. Every one that matches an answer the player actually gave counts as one match.                                  |
| `rewards`    | yes      | `{ minMatches: number, effects: Effect[] }[]` | Tiers of effects, unlocked once the match count reaches `minMatches`. Only the effects of the _highest_ satisfied tier are applied — lower tiers are not combined. |
| `asset`      | no       | `{ badge?: string }`                          | Optional badge image path shown when the strategy is fulfilled.                                                                                                    |

> **Note:** a strategy whose `conditions` array is empty can never be fulfilled unless a reward's `minMatches` is `0` — the match count is always `0` regardless of the player's answers. `strategy-2` in `2022_campaign_strategies.json` currently ships this way and never triggers;

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

All rights reserved — see [LICENSE](LICENSE).
