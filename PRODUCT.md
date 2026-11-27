# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Shared record for the monorepo. Two products, two audiences:

- **Kampánykörút (apps/kampanykorut):** a mixed audience with no single primary group. Politics-curious Hungarian adults playing a short free session in the browser (often from a shared link, often on a phone); strategy players who replay campaigns to optimise vote shares and mandates; students and educators using it to understand the Hungarian electoral system and historical campaigns. Casual play comes first, with depth there for people who replay.
- **Campaign Maker (apps/campaign-maker):** community creators who author and share their own campaigns. Currently an early scaffold.

## Product Purpose

Kampánykörút is a free, browser-based Hungarian election campaign simulator. The player picks a campaign (historical or contemporary), a side and a candidate, then answers campaign questions turn by turn. Each decision applies effects to electoral data (party vote shares, supporter energy, momentum, candidate attributes), and results are recalculated with Hungarian electoral rules into parliamentary mandates and a final result. Success means a player finishes a campaign, understands why the result came out the way it did, and wants to replay or share it.

Campaign Maker lets creators build campaign content (election configuration, questions, answer effects, focus trees) that the game can load.

## Positioning

A playable model of real Hungarian elections: real district results and boundaries, real electoral mechanics (single-member districts, party lists, compensation), and campaigns spanning 1957 to 2026, every side playable. Strictly non-partisan: every party is playable and treated even-handedly, and no side is favoured in content, balance, or framing.

## Operating Context

- Played in the browser at kampanykorut.hu, desktop and mobile; Hungarian is the primary language, English is supported (i18next, `src/logic/langs/`).
- Session flow: landing, campaign selector (published/candidate/draft listing, "Új" badge for recent additions, classic vs strategic game mode), side and candidate selection, turn-based question loop with a district map, final results screen. Games are saved locally and can be resumed.
- Campaign content lives as data under `apps/kampanykorut/public/campaigns/<route>/` (format in `apps/kampanykorut/CAMPAIGN.md`).
- Supporting services: campaign-api (news from GitHub Discussions, bug reports, play-time), a local campaign MCP server for authoring/simulation.
- Analytics are cookieless and minimal (PostHog EU, opt-out in Settings, privacy page in HU/EN); see `docs/analitika-terv.md`.

## Capabilities and Constraints

- Domain invariants must hold: vote shares sum to 1.0, effects preserve electoral mass, redistribution deltas balance, `/domain` stays free of React and side effects.
- Results are deterministic for a given set of decisions.
- Privacy: no answer text, political preference tied to a person, or localStorage contents leave the device through analytics.
- Map attribution: maps drawn from OpenStreetMap-derived data must show the ODbL attribution.
- Licence: all rights reserved; source is public for portfolio/demonstration.
- Open: Campaign Maker's sharing/publishing model for community campaigns is not yet decided.

## Brand Commitments

- Name: Kampánykörút. Publisher/data controller: Cyclops Cat Studios.
- Brand assets in `brand-assets/` (svg, png).
- Voice: Hungarian-first; political copy stays even-handed across parties.

## Evidence on Hand

- Gameplay demo: `apps/kampanykorut/public/kampanykorut-demo.gif`.
- Real campaigns shipped under `apps/kampanykorut/public/campaigns/` (e.g. 1957, 2022, 2024, 2024 Budapest, 2026).
- Archival photography (e.g. Fortepan) under `apps/kampanykorut/public/`; credit as required by the source.
- No testimonials, player counts, press, or reviews on hand; do not fabricate any.

## Product Principles

1. Even-handed by construction: any change to content, balance, or presentation must work equally for every playable side.
2. Real mechanics, legible outcomes: the player should be able to trace a result back to their decisions and the electoral rules.
3. Quick to start, deep to replay: a casual visitor gets into a campaign fast; repeat players find strategy.
4. Data-driven campaigns: new campaigns arrive as content, not code, so creators can author them.
5. Respect the player's privacy: collect only what answers a named product question.
