## Campaign Data (JSON)

Each playable campaign lives under `public/campaigns/{year_title}/{partyId}/` (e.g. `public/campaigns/2022_beke-vs-remeny/ellenzeki_osszefogas/`) and is driven turn by turn by a pair of files: a **questions** file and a matching **answer effects** file. This section documents both. Other files in the same folder (`{year}_campaign_strategies.json`, `advisor_feedback.json`, …) follow a similar shape and will be documented separately.

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

#### Advisor feedback

`advisor_feedback.json`

Optional data set. Reacts to any of the possible answers to a given question: it evaluates the answer that was picked and can also offer guidance for answering upcoming questions. Corresponds to the `AdvisorFeedback` type ([shared/types/answer-feedback.ts](shared/types/answer-feedback.ts)); resolved in `CampaignEngine.getAdivsorFeedback` ([shared/domain/CampaignEngine.ts](shared/domain/CampaignEngine.ts)). Only surfaced to the player while the `showAdvisorFeedback` game setting is enabled (on by default).

```json
[
  {
    "questionId": "2022_ogyv-6",
    "conditionalAnswers": [
      {
        "if": [{ "questionId": "2022_ogyv-3", "answerId": "C" }],
        "answer": {
          "answerId": "D",
          "text": "Feedback to D, shown instead of its entry below"
        }
      }
    ],
    "answers": [
      { "answerId": "A", "text": "Feedback to A" },
      { "answerId": "B", "text": "Feedback to B" },
      { "answerId": "C", "text": "Feedback to C" },
      { "answerId": "D", "text": "Feedback to D" }
    ]
  }
]
```

| Field                | Required | Type                                                               | Description                                                                                                                                                                                                                                                              |
| -------------------- | -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `questionId`         | yes      | `string`                                                           | Id of the question this entry belongs to.                                                                                                                                                                                                                                |
| `answers`            | yes      | `{ answerId: string, text: string }[]`                             | One feedback text per possible answer of the question, keyed by `answerId`.                                                                                                                                                                                              |
| `conditionalAnswers` | no       | `{ if: { questionId, answerId }[], answer: { answerId, text } }[]` | Alternate feedback for a single answer (`answer.answerId`), meant to be shown instead of that answer's entry in `answers` when every condition in `if` matches an answer previously given on an earlier question. Checked in order; the first fully-matching entry wins. |

> **Known inconsistency (TODO):** `CampaignEngine.resolveConditionalFeedback` returns the first `conditionalAnswers` entry whose `if` history matches, without checking whether `answer.answerId` matches the answer the player actually picked on the current turn. In practice a conditional override can therefore be shown even when the player chose a different answer than `answer.answerId`.

### Not party-related data

#### Election config

`election_config.json`

Describes the election itself: seat math, the real-world party list, and which parties/candidates the player can choose from. Loaded once per campaign, independent of turn/question progression. Corresponds to the `ElectionConfig` type ([shared/types/configs/election-config.ts](shared/types/configs/election-config.ts)); consumed by `MandateCalculator` ([shared/domain/MandateCalculator.ts](shared/domain/MandateCalculator.ts)) for seat allocation.

```json
{
  "title": "Béke vs Remény",
  "year": "2022",
  "listSeats": 93,
  "allSeats": 199,
  "thresholdPercent": 5,
  "districtBoost": true,
  "baseResults": { "ellenzeki_osszefogas": 3, "fidesz": -3 },
  "parties": [{ "id": "fidesz", "name": "Fidesz–KDNP", "color": "#F28E2B" }],
  "partyListVotes": {
    "fidesz": 2809238,
    "ellenzeki_osszefogas": 1936297,
    "_other": 30635
  },
  "playableSides": [
    {
      "id": "ellenzeki_osszefogas",
      "label": "Egységben Magyarországért",
      "description": "Coalition description shown to the player...",
      "mainCandidates": [
        {
          "id": "marki_zay_peter",
          "label": "Márki-Zay Péter",
          "description": "Candidate bio shown to the player..."
        }
      ],
      "playableCandidates": ["marki_zay_peter"]
    }
  ],
  "electionAssets": [
    {
      "id": "ellenzeki_osszefogas",
      "party_logo": "/images/2022/ellenzeki-osszefogas.png",
      "candidateAssets": [
        {
          "id": "marki_zay_peter",
          "portrait": "/images/2022/mzp-portrait.png",
          "slogan": "/images/2022/ellenzeki_osszefogas_2022_kampany_szoveg.png"
        }
      ]
    }
  ]
}
```

| Field                                | Required | Type                                                    | Description                                                                                                                                                                                                        |
| ------------------------------------ | -------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`                              | yes      | `string`                                                | Display name of the election, e.g. shown as the campaign's title.                                                                                                                                                  |
| `year`                               | yes      | `string`                                                | The election year, e.g. `"2022"`.                                                                                                                                                                                  |
| `listSeats`                          | yes      | `number`                                                | Number of seats distributed by national party-list compensation, allocated with a D'Hondt-style divisor method (`MandateCalculator.allocateListSeats`).                                                            |
| `allSeats`                           | yes      | `number`                                                | Total number of seats in the parliament being contested. The number of individual-constituency seats is derived as `allSeats - listSeats` (used e.g. by the end-of-game statistics screen).                        |
| `thresholdPercent`                   | yes      | `number`                                                | Minimum share of national party-list votes (in percent) a party needs to qualify for list-seat compensation.                                                                                                       |
| `districtBoost`                      | no       | `boolean`                                               | When `true`, every even-numbered turn where the player has a district selected grants their party a bonus transfer of 500 undecided ("bizonytalan") votes in that district — see `EffectApplier.getBoosterEffect`. |
| `baseResults`                        | no       | `Record<partyId, number>`                               | A one-off `uniform-swing`-style adjustment (percentage points per party) applied once, before the first question, to seed the starting poll numbers.                                                               |
| `parties`                            | yes      | `{ id: string, name: string, color: string }[]`         | Every party competing in the election, used for labels/legend colors throughout the UI — not just the ones the player can choose.                                                                                  |
| `partyListVotes`                     | yes      | `Record<partyId, number>`                               | The real/base national party-list vote counts, used as the starting point before any in-game effects are applied. The `_other` key groups votes for parties not listed individually.                               |
| `playableSides`                      | yes      | `PlayableSide[]`                                        | The sides (parties/coalitions) offered on the campaign's start screen.                                                                                                                                             |
| `playableSides[].mainCandidates`     | yes      | `{ id: string, label: string, description?: string }[]` | Candidates shown for this side on the start screen.                                                                                                                                                                |
| `playableSides[].playableCandidates` | no       | `string[]`                                              | Ids (from `mainCandidates`) meant to restrict which candidates the player can pick. ⚠️ Not currently read anywhere at runtime — every candidate in `mainCandidates` is selectable regardless of this field.        |
| `electionAssets`                     | yes      | `ElectionAsset[]`                                       | Image assets (logo, portraits, campaign slogans), keyed by the matching `playableSides[].id` and `mainCandidates[].id`.                                                                                            |
| `electionAssets[].candidateAssets`   | yes      | `{ id: string, portrait: string, slogan: string }[]`    | Portrait and campaign-slogan image paths per candidate.                                                                                                                                                            |

> **Known inconsistency (TODO):** `playableSides[].playableCandidates` is declared on the type and present in shipped campaign data (e.g. `["marki_zay_peter"]`), but no runtime code reads it — `useSideSelectorMenu` populates the candidate picker straight from `mainCandidates`, ignoring this field entirely.
