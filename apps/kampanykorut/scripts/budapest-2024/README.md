# Budapest 2024 campaign data

The `2024_budapest` campaign (`public/campaigns/2024_budapest`) starts from official
2024 district data and a January 2024 poll. This folder holds the source extract and
the scripts that turn it into campaign files, so the numbers can be checked and
regenerated.

## Regenerating

```sh
NODE_USE_ENV_PROXY=1 node apps/kampanykorut/scripts/budapest-2024/fetch-vtr.mjs
node apps/kampanykorut/scripts/budapest-2024/build-campaign-data.mjs
```

`fetch-vtr.mjs` downloads the 23 district result files and writes
`vtr-onk2024-budapest.json`. It fails if a district's votes do not add up to its valid
votes or if the ballot order differs between districts. `build-campaign-data.mjs`
writes `candidate_list_data.json` and `voter_environment_config.json`.
`NODE_USE_ENV_PROXY=1` is only needed behind an HTTP proxy.

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

`campaign_events.json` decides after the 26th decision (7 June in the story): she
withdraws if she is third or lower and at least 3 points behind the candidate one
place ahead (`candidate-rank`), otherwise she stays in the race. She starts third,
2.4 points behind Vitézy. Decisions 27–31 have a version for each
outcome, selected with `visibleIf` on her candidate status.

The direction of the transfer (see below) follows a regression of the 2024
district results on the assembly list results: the Fidesz–KDNP list share explains
Vitézy's mayoral share with a coefficient of about 0.94, and Karácsony's with about 0. With 23 districts this is only a sanity check, not a measurement.

## Answer effects

The answer effects are a design model, not measured data. Every number is an
estimate, tuned by simulation against the bands in `budapest2024Campaign.test.ts`.

- **Units.** Effects are mostly `uniform-swing`: percentage points of each
  district's decided votes. A positive value mobilizes undecided voters, a negative
  one sends voters back to the undecided pool, and a pair (Vitézy +, Karácsony −)
  is a conversion. `turnout-change` is not used while it is being reworked.
- **What each answer does.** The advisor reaction names a gain and a cost. The gain
  sets the main move, the cost sets the side effect:
  - courting Fidesz voters takes from Szentkirályi but mobilizes Karácsony's base;
  - courting the opposition takes from Karácsony but keeps Fidesz voters with
    Szentkirályi;
  - evasive answers give little.
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
  - 29/V-D makes 32C worth more.

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

Simulated results with the district boost used every second turn:

| Play                                      | Szentkirályi withdraws | Vitézy wins        |
| ----------------------------------------- | ---------------------- | ------------------ |
| random answers                            | 85%                    | 16%                |
| documented real answers, random elsewhere | 100%                   | 94% (+1.6 points)  |
| one strategy, random elsewhere            | 52–100%                | 45–67%             |
| best answer each turn                     | 100%                   | wins by 8 points   |
| worst answer each turn                    | 100%                   | loses by 11 points |
