# Kampánykörút – Election Simulation Game

### Campaign Engine

The `CampaignEngine` orchestrates gameplay:

- 🕹️ Manages game state across turns
- ⚡ Applies player decisions to electoral data
- 🧮 Calculates mandate results after each decision
- 🔗 Integrates with effect systems and calculators

### Decision Effects

Player decisions trigger `RawEffect` objects that modify:

- 👤 **Candidate lists**: Demographics, qualifications, recognition
- 🏛️ **Party data**: Vote shares, supporter energy, momentum
- 🗺️ **Electoral dynamics**: Redistribution between parties and districts

### Result Calculation

The `MandateCalculator` converts vote shares to parliamentary seats using Hungarian electoral rules:

- ⚖️ Proportional representation system
- 📍 Single-mandate district voting
- 📋 Compensation list allocation

## 🏗️ Project Architecture

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

## 📁 Data Formats

Game data lives under two top-level folders in `public/`:

- 🗳️ `public/campaigns/{year_title}/` - election-year data (district results, configuration) plus, per party, the campaign content itself (questions, effects, strategies, advisor feedback)
- 🌐 `public/assets/jsons/` - global data shared across every campaign
- 🖼️ `public/assets/images/{year_title}` - images releated to the campaigns

### See [CAMPAIGN.md](CAMPAIGN.md) for the full file format documentation

### Internationalization

Supports multiple languages, located in `src/logic/langs/`:

- 🇬🇧 `en_lang.json` - English
- 🇭🇺 `hu_lang.json` - Hungarian

### Debug Mode

Campaigns with `isPublished: false` in `game_modes.json` are hidden from the campaign selector by default. Toggle visibility at runtime from the browser console:

```js
window.debugMode.enable();
```

## ⚡ Performance Considerations

- 🧠 Heavy components are memoized to prevent unnecessary re-renders
- 📦 Objects are created outside render functions when possible
- 🔑 Stable keys used in lists to optimize reconciliation
- 🎯 Domain logic executes synchronously for deterministic results

## 🧪 Testing Strategy

Every transformer and calculator includes tests for:

- ✅ Happy path (normal operation)
- ⚪ Zero-delta case (no effect)
- 🔍 Edge redistribution cases (boundary conditions)

## 🤝 Contributing

This project follows strict architectural guidelines:

- 🧬 Domain logic must remain pure and deterministic
- 🎨 UI components should not contain calculation logic
- 🔒 All game rules are enforced via domain invariants
- ✅ Tests should validate both happy paths and edge cases