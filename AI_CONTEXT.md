# Kampánykörút – AI Context

## What this project is

Election simulation game.
React + TypeScript frontend.
Domain-driven architecture.

## Architecture Overview

/domain
  Pure deterministic logic.
  No React imports allowed.

/application
  Orchestrates domain operations.

/ui
  React components only.
  No calculation logic allowed.

/mods
  JSON-based mod configuration.

## Core Invariants

1. Vote shares must sum to 1.
2. Redistribution must preserve total mass.
3. DeltaSum must remain near zero.
4. Domain must stay pure and deterministic.

## Performance Rules

- Heavy components must be memoized.
- Avoid recreating objects inside render.
- Use stable keys in lists.

## Testing Rules

- Every transformer must test:
  - happy path
  - zero-delta case
  - edge redistribution case
