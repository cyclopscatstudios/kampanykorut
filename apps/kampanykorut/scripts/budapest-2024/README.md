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

`campaign_events.json` withdraws her after any decision from the 25th to the 32nd
while her city-wide share of the decided vote is below 15%. She starts at 25%.

The transfer (Vitézy 85%, Grundtner 5%, Karácsony 3%, abstain 7%) is a design
estimate. A regression of the 2024 district results on the assembly list results
points the same way: the Fidesz–KDNP list share explains Vitézy's mayoral share with
a coefficient of about 0.94, and Karácsony's with about 0. With 23 districts this is
only a sanity check, not a measurement.
