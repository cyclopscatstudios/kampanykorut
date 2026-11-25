---
name: campaign-balance
description: Plan and interpret repeatable Kampánykörút campaign simulations, compare answer strategies, and turn outcome data into testable balance hypotheses. Use when discussing vote shares, mandates, focus effects, or dominant strategies.
---

# Kampánykörút balance analysis

Use the real campaign engine and reproducible simulation output whenever available. Do not estimate seat outcomes from vote percentages by intuition.

## Simulation API

In a Vite development session, `window.kampanykorut.simulateCampaign` runs campaigns through the production domain engine without changing the active game session or saving turn history.

```js
await window.kampanykorut.simulateCampaign(
  "2026_tavaszi_szel",
  { partyId: "tisza", candidateId: "magyar_peter" },
  { runs: 100, seed: 42, mode: "random" },
);
```

Modes:

- `first`: always choose the first available answer.
- `last`: always choose the last available answer.
- `random`: choose uniformly among available answers using the supplied seed.

An optional `answerPlan` maps question IDs to answer IDs. Those choices are fixed in every run; unlisted questions use the selected mode. The same seed and inputs produce the same results. Runs are limited to 5,000 per call.

The summary reports each party's average, minimum, and maximum total seats, average party-list vote share, and fractional win share. A tied seat result splits that run's win share evenly among the tied parties.

## Analysis workflow

1. State the question being tested (for example, whether one focus creates a consistently dominant path).
2. Read the campaign's actual question, effect, focus, strategy, election, and district data before selecting answer plans.
3. Compare a baseline and one controlled change at a time. Keep the seed and run count fixed for direct comparisons.
4. Use `first`, `last`, and uniform `random` as simple coverage scenarios, not as realistic models of human players or intelligent political behavior.
5. Report observed results separately from interpretation. Explain which choices were fixed and which were sampled.
6. Recommend the smallest balance change that could address the observed issue, and propose a follow-up simulation to check it. Do not edit balance data unless asked.

## Limits

This simulator does not model district visits, district boosts, human decision-making, or player skill. Do not claim that a strategy is dominant based only on uniform random choices. Confirm that the result is not caused by an accidental answer-plan ID, a campaign-data issue, or a special end-game reward before recommending a balance change.
