# Budapest 2024 campaign data

The `2024_budapest` campaign (`public/campaigns/2024_budapest`) starts from official
2024 district data and a January 2024 poll. This folder holds the source extract and
the scripts that turn it into campaign files, so the numbers can be checked and
regenerated.

## Regenerating

```sh
NODE_USE_ENV_PROXY=1 node apps/kampanykorut/scripts/budapest-2024/fetch-vtr.mjs
node apps/kampanykorut/scripts/budapest-2024/build-campaign-data.mjs
node apps/kampanykorut/scripts/budapest-2024/answer-effects.mjs
```

`fetch-vtr.mjs` downloads the 23 district result files and writes
`vtr-onk2024-budapest.json`. It fails if a district's votes do not add up to its valid
votes or if the ballot order differs between districts. `build-campaign-data.mjs`
writes `candidate_list_data.json` and `voter_environment_config.json`.
`NODE_USE_ENV_PROXY=1` is only needed behind an HTTP proxy.

`answer-effects.mjs` writes `answer_effects.json`, `campaign_strategies.json`,
`custom_groups.json` and `campaign_events.json`. These files are generated: change
the tables in the script (`ANSWERS`, `CONDITIONAL`, `STRATEGIES`) and the tuning
constants (`TUNING`, `WITHDRAWAL`), not the JSON. Questions and advisor feedback are
not generated.

## Karácsony side

`dk_mszp_parbeszed/karacsony_gergely` is the second playable side. Its questions and
advisor feedback are hand-written. `karacsony-effects.mjs` writes its
`answer_effects.json` and `campaign_strategies.json` from the same kind of tables
(`ANSWERS`, `CONDITIONAL`, `STRATEGIES`, `TUNING`). It also exports the
consolidation events, which `answer-effects.mjs` adds to the shared
`campaign_events.json`, so run both after changing them.

```sh
node apps/kampanykorut/scripts/budapest-2024/karacsony-effects.mjs
node apps/kampanykorut/scripts/budapest-2024/answer-effects.mjs
BUDAPEST_SIM=1 yarn vitest run --config apps/kampanykorut/vite.config.ts shared/validation/budapest2024KaracsonySimulation.test.ts
```

The winning line is to split the opposition:

1. **Before the deadline, fight Vitézy.** Attacks on him (7A, 13A–B, 18A, 22B,
   24B–C) take his voters and send part of them to Szentkirályi. If she stays within
   3 points of Vitézy at the 26th decision, she does not withdraw. Without such
   attacks she usually withdraws: Vitézy's voters drift faster (0.30 points per
   answer) than hers (0.17).
2. **After the deadline, keep the two challengers level.** From the 27th decision on,
   the anti-Karácsony vote consolidates behind whichever challenger leads the other by
   3 points or more: 3 points move from the third to the second after every
   decision (`CONSOLIDATION`). Lifting Vitézy (27/N-C, 28/N-C, 28/N-D, 30/N-D) or
   Szentkirályi (27/N-B, 28/N-B) keeps them level. Lifting either one too far starts
   the consolidation in the other direction.

The consolidation events are gated on
`{ "type": "player-candidate", "candidateId": "karacsony_gergely" }`, so they only
fire when the player plays Karácsony.

If Szentkirályi withdraws, the "Fidesz candidate" frame (7A, 25A) makes 27/V-A and
27/V-B take more voters from Vitézy. These are `CONDITIONAL` entries, so the
event's `redistribution` stays fixed.

Simulated results (300 games per row, district boost every second turn):

| Play                                                    | Szentkirályi withdraws | Karácsony wins |
| ------------------------------------------------------- | ---------------------- | -------------- |
| random answers                                          | 83%                    | 18%            |
| documented real answers, random elsewhere               | 98%                    | 46% (−0.1 pts) |
| one strategy, random elsewhere                          | 36–89%                 | 45–61%         |
| split plan: attacks before, best answer in the N branch | 0%                     | 100%           |
| best answer each turn                                   | 0%                     | 100%           |
| keep Szentkirályi ahead of Vitézy every turn            | 0%                     | 0%             |
| worst answer each turn                                  | 100%                   | 0%             |

With random answers Karácsony wins almost none of the games where Szentkirályi
withdraws and about half of the others. Only the documented "Fidesz candidate"
frame makes the two-way race close.

## Simulating

```sh
node apps/kampanykorut/scripts/budapest-2024/answer-effects.mjs
BUDAPEST_SIM=1 yarn vitest run --config apps/kampanykorut/vite.config.ts shared/validation/budapest2024Simulation.test.ts
```

The simulation plays the real campaign through the engine and prints, for each
playing style, how often Szentkirályi withdraws, how often Vitézy wins, the average
Vitézy–Karácsony margin and the shares after the 25th decision. `BUDAPEST_SIM_RUNS`
sets the number of games (default 300) and `BUDAPEST_SIM_OUT` writes the rows as
JSON. The styles are defined in `shared/validation/budapest2024Playthrough.ts`; the
balance tests in `budapest2024Campaign.test.ts` use the same code with fixed bands.

## Sources

| Data                                     | Source                                                                                  | Kind     |
| ---------------------------------------- | --------------------------------------------------------------------------------------- | -------- |
| Eligible voters and turnout per district | NVI, 2024 local elections, mayor of Budapest (`valaltip` 2), `vtr.valasztas.hu/onk2024` | official |
| Mayoral votes per district               | NVI, same files (`valaltip` 2)                                                          | official |
| City assembly list votes per district    | NVI, same files (`valaltip` F)                                                          | official |
| City-wide starting shares                | Medián poll, 25 January 2024: Karácsony 36, Vitézy 23, Fidesz candidate 21              | poll     |
| Grundtner's starting share (4%)          | design estimate, the poll does not list him                                             | estimate |
| Withdrawal window, threshold, transfers  | design estimate, see below                                                              | estimate |

The extract is the count published at download time (`fetchedAt`), before the
recount. It only shapes the geography; the real result is not the starting state.

## How the starting state is built

- `valasztopolgar` is the district's eligible voters (`vp_osszes`).
- Each candidate's city-wide starting votes are their poll share times the 2024
  turnout (807,056). Everyone else in the district is undecided.
- These votes are spread across the districts in proportion to a geography proxy,
  rounded with the largest remainder so the city-wide totals stay exact:
  - Karácsony and Grundtner: their own 2024 mayoral votes.
  - Szentkirályi: the Fidesz–KDNP city assembly list. She withdrew before election
    day, so she has no 2024 votes of her own.
  - Vitézy: the LMP–Podmaniczky city assembly list. His mayoral votes already
    include most of Szentkirályi's voters.
- The candidate ↔ list pairing comes from the candidate-group id (`jlcs_id`) in the
  source, not from a hard-coded ballot number.

## Szentkirályi's withdrawal

`campaign_events.json` decides after the 26th decision (7 June in the story). She
withdraws if both hold (`candidate-rank`):

- she is third or lower and at least 3 points behind the candidate one place ahead;
- Vitézy is second and at most 15 points behind Karácsony. If Karácsony is out of
  reach, giving up the Fidesz candidate would gain nothing.

Otherwise she stays in the race. She starts third, 2.4 points behind Vitézy.
Decisions 27–31 have a version for each outcome, selected with `visibleIf` on her
candidate status.

The direction of the transfer (see below) follows a regression of the 2024
district results on the assembly list results: the Fidesz–KDNP list share explains
Vitézy's mayoral share with a coefficient of about 0.94, and Karácsony's with about 0. With 23 districts this is only a sanity check, not a measurement.

## Answer effects

The answer effects are a design model, not measured data. Every number is an
estimate, tuned by simulation against the bands in `budapest2024Campaign.test.ts`.
The `ANSWERS` table holds each answer's intended direction and relative size;
`TUNING` scales them (Vitézy's gains ×0.4, Karácsony's losses ×0.5 and gains ×0.7,
Szentkirályi's gains ×0.35), so the table stays readable and the overall pace is
one place to change.

- **Units.** Effects are mostly `uniform-swing`: percentage points of each
  district's decided votes. A positive value mobilizes undecided voters, a negative
  one sends voters back to the undecided pool, and a pair (Vitézy +, Karácsony −)
  is a conversion. `turnout-change` is not used while it is being reworked.
- **What each answer does.** The advisor reaction names a gain and a cost. The gain
  sets the main move, the cost sets the side effect:
  - courting Fidesz voters takes from Szentkirályi but mobilizes Karácsony's base;
  - courting the opposition takes from Karácsony but keeps Fidesz voters with
    Szentkirályi;
  - evasive or self-defeating answers cost Vitézy votes: silence (3D, 13D, 21D),
    the late announcement (4D), sounding like Karácsony (9C, 11B), keeping away
    from the Tisza voters (20B), a leaked backroom deal (20D, 29/N-C) or ignoring
    the accusations (25D, 28/V-D) send some of his voters back to the undecided
    pool. Losses are not scaled down, so one bad answer outweighs one average gain;
  - the answers the real campaign chose are reasonable but not the strongest, so
    winning takes something the real campaign did not do.
- **Rivals campaign too.** Every answer also adds 0.15 points to Karácsony and 0.22
  to Szentkirályi from the undecided pool. Without this, even the weakest answers
  would pull Vitézy ahead.
- **Districts.** Some answers move votes by `custom_groups.json` zones:
  - `belvaros`: I, V, VI, VII, VIII, IX and XIII;
  - `atmeneti`: II, III, IV, X, XI, XII and XIV;
  - `peremkerulet`: XV–XXIII.

  Answer 9D targets Kőbánya (X) directly.

- **Conditional effects.** These follow the editorial notes:
  - 4A makes 13A cost more and 13B less;
  - 4C makes the late field campaigns (26A, 32A) weaker;
  - 21A strengthens 23A, and 10A strengthens 23B;
  - 14D strengthens 17D;
  - after 25C, every answer of 27/V except C loses votes, and 27/V-B loses more;
  - 8A, 18A, 25B and 27/V-B each weaken 28/V-A and 28/V-D;
  - 29/V-D, which leaves the crossed-out-name trap alone and costs votes, makes 32C
    worth more.

## Strategies

`campaign_strategies.json` holds the four lines of the design document. The shared
decisions are 5, 14, 23, 26 and 31; the other conditions are the "saját feltétel"
answers.

| Id                 | Label                           | Conditions                     |
| ------------------ | ------------------------------- | ------------------------------ |
| `varosmernok`      | Budapest működjön (TC)          | 5A 14C 23B 26D 31A 10A 16A 18A |
| `ellenzekvaltas`   | Ellenzékváltás (EV)             | 5B 14D 23C 26C 31B 20A 30A     |
| `karacsony_valtas` | Karácsony-váltás (JÁ)           | 5C 14A 23A 26A 31C 8A 11A 15A  |
| `zold_orokseg`     | Amit megígértek, megépítem (ZU) | 5D 14B 23D 26B 31D 13C 16B 22A |

Each strategy has a reward at 4 and at 6 matching answers, applied after the last
decision. Decisions 30 and 31 count with either their `_v` or `_n` version.

## Withdrawal and balance

On withdrawal, 55% of Szentkirályi's voters go to Vitézy, 4% to Grundtner and 3% to
Karácsony; 38% stay at home or vote invalid. Karácsony's camp also mobilizes (+3
points). The V branch decisions decide how much of this Vitézy keeps: 27/V-C
rejects the Fidesz voters, while 29/V-A or C brings back the voters lost to the
crossed-out name.

If Szentkirályi stays in the race, Vitézy fights for second place and cannot win;
the doc's 28/N ("Harc a második helyért") assumes the same.

Simulated results with the district boost used every second turn (400 games per
row):

| Play                                      | Szentkirályi withdraws | Vitézy wins        |
| ----------------------------------------- | ---------------------- | ------------------ |
| random answers                            | 63%                    | 8%                 |
| documented real answers, random elsewhere | 100%                   | 56% (margin +0.2)  |
| one strategy, random elsewhere            | 36–99%                 | 29–47%             |
| best answer each turn                     | 100%                   | wins by 9 points   |
| worst answer each turn                    | 0%                     | loses by 22 points |

With the worst answers Vitézy falls from 27.4% to 24.5% by the 25th decision. A
strategy followed with random answers elsewhere also picks some of the costly
answers; a player who follows a strategy and avoids them does better.

## Szentkirályi side (work in progress)

`szentkiralyi-effects.mjs` writes
`fidesz_kdnp/szentkiralyi_alexandra/answer_effects.json` from its own `ANSWERS`,
`CONDITIONAL` and `TUNING` tables. The questions and advisor feedback are drafts;
strategies are not written yet (`campaign_strategies.json` is an empty array). The
side is listed in `manifest.json` and `election_config.json`; it has no election
assets yet.

```sh
node apps/kampanykorut/scripts/budapest-2024/szentkiralyi-effects.mjs
```

- **Player.** `Sz` is the player. Gains are scaled ×1.1, losses ×1.0. Every answer
  also adds 0.1 points to Karácsony and 0.2 to Vitézy (rivals campaign too).
- **Identity axis.** Answers tagged `pártközpont` mobilize Szentkirályi's base but
  also Karácsony's; `önálló` answers bring more, mostly from the undecided pool and
  from Vitézy's soft right. Attacking Vitézy (`háromszereplős`) costs him votes but
  does not close the gap to Karácsony.
- **Branch.** Szentkirályi never withdraws on her own side. Decision 24 has two
  versions, selected by whether 21A (the three-way debate) was chosen.
- **Withdrawal.** `szentkiralyi_alexandra_withdrawal` is gated with
  `{ "not": { "type": "player-candidate", "candidateId": "szentkiralyi_alexandra" } }`,
  so it never fires on her own side. `szentkiralyi_alexandra_stays` has no effects
  and still announces that she stayed in the race.

Simulated with the player side set, the shared events and the district boost
every second turn (100 games per row, starting shares K 42.9 / V 27.4 / Sz 25.0 of
decided votes):

| Play                                    | Szentkirályi wins | Margin |
| --------------------------------------- | ----------------- | ------ |
| random answers                          | 0%                | −7.4   |
| `pártközpont` answers, random elsewhere | 0%                | −11.7  |
| `önálló` answers, random elsewhere      | 100%              | +1.0   |
| `önálló` or `Tarlós-örökség` answers    | 50%               | +0.2   |
| `háromszereplős` answers                | 0%                | −8.0   |
| best answer each turn                   | wins              | +2.8   |
| worst answer each turn                  | loses             | −16.7  |
