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

| Field             | Required | Type                              | Description                                                                                                                                                                                                                       |
| ----------------- | -------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | yes      | `string`                          | Unique question id. Convention: `{year}_{electionShortName}-{questionNumber}`, e.g. `2022_ogyv-1`.                                                                                                                                |
| `question`        | yes      | `string`                          | The question text shown to the player. ⚠️ Planned to be renamed to `label`; a max character length is not yet defined.                                                                                                            |
| `possibleAnswers` | yes      | `{ id: string, label: string }[]` | The answer options — currently always exactly 4.                                                                                                                                                                                  |
| `title`           | no       | `string`                          | Short topic/category label shown above the question.                                                                                                                                                                              |
| `affects`         | no       | `{ id: string }[]`                | Ids (from `possibleAnswers`) of answers to _this_ question that unlock a `conditionalEffects` block on a _later_ question — see [answer effects](#yearanswer_effectsjson) below.                                                  |
| `requires`        | no       | `{ questionId, answerId }[]`      | This question is only shown if **every** referenced answer was selected before (or on the current turn).                                                                                                                          |
| `blocks`          | no       | `{ questionId, answerId }[]`      | This question is skipped if **any** referenced answer was selected before (or on the current turn).                                                                                                                               |
| `visibleIf`       | no       | `Condition`                       | This question is only shown while the [condition](#conditions) is met, e.g. `{ "type": "candidate-status", "candidateId": "szentkiralyi_alexandra", "status": "active" }`. Combined with `requires` and `blocks` (all must hold). |

Questions are shown in file order. After every answer (and the campaign events of that turn) the next shown question is the first one **after the current position** whose `visibleIf`, `requires` and `blocks` hold for the state at that moment; a skipped question is never revisited. The campaign ends when no eligible question is left. The turn counter in the header shows the decisions made so far plus the eligible questions still ahead.

**Every branch must show the same number of decisions.** A campaign can have any number of questions, but if a branch skips some, it must add exactly as many replacement questions — e.g. `question_25` with `"visibleIf": { "type": "candidate-status", …, "status": "active" }` and `question_25_after_withdrawal` with `"status": "inactive"`. For questions whose conditions only use `candidate-status` (combined with `and`/`or`/`not`), the validator counts the shown questions for every combination of candidate statuses and warns (`question-count-differs`) if they differ; branches that depend on answers, support, turns or events cannot be checked statically and need a playthrough test.

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

| Field                                | Required      | Type                                                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------ | ------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`                              | yes           | `string`                                                           | Display name of the election, e.g. shown as the campaign's title.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `year`                               | yes           | `string`                                                           | The election year, e.g. `"2022"`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `election`                           | no            | `{ type: "parliamentary" \| "mayoral", resultRule?: "plurality" }` | Election kind. Omitted means `"parliamentary"`. `"mayoral"` describes a single city-wide office decided by plurality (`MayoralResultCalculator`); districts are only the unit of the simulation. In a mayoral election every vote key (`partok`, effect params, `baseResults`) is a **candidate id**: each `parties` entry is a ballot line, and every `playableSides[].mainCandidates[].id` must appear there. `playableSides[].id` is only a grouping key and need not be a ballot line. ⚠️ The end-results screen does not support mayoral elections yet. |
| `listSeats`                          | parliamentary | `number`                                                           | Number of seats distributed by national party-list compensation, allocated with a D'Hondt-style divisor method (`MandateCalculator.allocateListSeats`).                                                                                                                                                                                                                                                                                                                                                                                                      |
| `allSeats`                           | parliamentary | `number`                                                           | Total number of seats in the parliament being contested. The number of individual-constituency seats is derived as `allSeats - listSeats` (used e.g. by the end-of-game statistics screen).                                                                                                                                                                                                                                                                                                                                                                  |
| `thresholdPercent`                   | parliamentary | `number`                                                           | Minimum share of national party-list votes (in percent) a party needs to qualify for list-seat compensation.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `districtBoost`                      | no            | `boolean`                                                          | When `true`, every even-numbered turn where the player has a district selected grants their party a bonus transfer of 500 undecided ("bizonytalan") votes in that district — see `EffectApplier.getBoosterEffect`.                                                                                                                                                                                                                                                                                                                                           |
| `baseResults`                        | no            | `Record<partyId, number>`                                          | A one-off `uniform-swing`-style adjustment (percentage points per party) applied once, before the first question, to seed the starting poll numbers.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `parties`                            | yes           | `{ id: string, name: string, color: string }[]`                    | Every party competing in the election, used for labels/legend colors throughout the UI — not just the ones the player can choose.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `partyListVotes`                     | yes           | `Record<partyId, number>`                                          | The real/base national party-list vote counts, used as the starting point before any in-game effects are applied. The `_other` key groups votes for parties not listed individually.                                                                                                                                                                                                                                                                                                                                                                         |
| `playableSides`                      | yes           | `PlayableSide[]`                                                   | The sides (parties/coalitions) offered on the campaign's start screen.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `playableSides[].mainCandidates`     | yes           | `{ id: string, label: string, description?: string }[]`            | Candidates shown for this side on the start screen.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `playableSides[].playableCandidates` | no            | `string[]`                                                         | Ids (from `mainCandidates`) meant to restrict which candidates the player can pick. ⚠️ Not currently read anywhere at runtime — every candidate in `mainCandidates` is selectable regardless of this field.                                                                                                                                                                                                                                                                                                                                                  |
| `electionAssets`                     | yes           | `ElectionAsset[]`                                                  | Image assets (logo, portraits, campaign slogans), keyed by the matching `playableSides[].id` and `mainCandidates[].id`.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `electionAssets[].candidateAssets`   | yes           | `{ id: string, portrait: string, slogan: string }[]`               | Portrait and campaign-slogan image paths per candidate.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

> **Known inconsistency (TODO):** `playableSides[].playableCandidates` is declared on the type and present in shipped campaign data (e.g. `["marki_zay_peter"]`), but no runtime code reads it — `useSideSelectorMenu` populates the candidate picker straight from `mainCandidates`, ignoring this field entirely.

#### Campaign events

`campaign_events.json` (manifest key `files.campaignEvents`)

Optional, campaign-wide (shared by every playable side). Events are evaluated at the end of every answered turn, after the answer's effects (and, on the last turn, the campaign strategies) have been applied and the results recalculated. Corresponds to the `CampaignEvent` type ([shared/types/campaign-event.ts](shared/types/campaign-event.ts)); evaluated by `CampaignEventEngine` ([shared/domain/CampaignEventEngine.ts](shared/domain/CampaignEventEngine.ts)).

```json
[
  {
    "id": "szentkiralyi_alexandra_withdrawal",
    "label": "Szentkirályi Alexandra Withdrawal",
    "once": true,
    "priority": 100,
    "conditions": [
      {
        "if": {
          "and": [
            { "type": "turn", "min": 18, "max": 32 },
            {
              "type": "candidate-support",
              "candidateId": "szentkiralyi_alexandra",
              "operator": "<",
              "value": 0.3
            },
            {
              "type": "answer-selected",
              "questionId": "question_12",
              "answerId": "answer_3"
            }
          ]
        },
        "effects": [
          { "type": "uniform-swing", "params": { "vitezy_david": 2 } }
        ]
      }
    ],
    "announcement": {
      "title": "Szentkirályi Alexandra visszalép",
      "body": "A főpolgármester-választási mezőny megváltozott."
    }
  }
]
```

| Field          | Required | Type                                                  | Description                                                                                                                                                                                                              |
| -------------- | -------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`           | yes      | `string`                                              | Unique, stable event id. It is stored in saved games, so **never rename an id once the campaign is published** — a renamed event would run again in games that already triggered it.                                     |
| `label`        | no       | `string`                                              | Name for authors and logs.                                                                                                                                                                                               |
| `once`         | no       | `boolean`                                             | Defaults to `true`: the event runs at most once per game. `false` re-evaluates it every turn.                                                                                                                            |
| `priority`     | no       | `number`                                              | Defaults to `0`. Higher runs first; ties keep their order in the file.                                                                                                                                                   |
| `conditions`   | yes      | `{ if: Condition, effects: CampaignEventEffect[] }[]` | Alternative branches in order. The effects of the **first** branch whose `if` is met are applied, then the event counts as triggered. `effects` use the answer effect types above plus `withdraw-candidate` (see below). |
| `announcement` | no       | `{ title: string, body: string, imageUri?: string }`  | Queued for the player when the event runs. ⚠️ Not shown in the UI yet.                                                                                                                                                   |

Every event is evaluated once per turn, in priority order, against the state left by the events before it — so a later event can react to an earlier one in the same turn, but the list is never re-run within a turn. Evaluation is deterministic: the same campaign data and the same answers always trigger the same events.

##### Candidate withdrawal

Besides the answer effect types, an event branch may contain a `withdraw-candidate` effect (mayoral elections only, never as an answer effect):

```json
{
  "type": "withdraw-candidate",
  "candidateId": "szentkiralyi_alexandra",
  "endorsedCandidateId": "vitezy_david",
  "reason": "withdrawal",
  "redistribution": {
    "vitezy_david": 0.8,
    "karacsony_gergely": 0.1,
    "_abstain": 0.1
  }
}
```

In one step it marks the candidate `inactive` (with `reason`, default `"withdrawal"`, the optional `endorsedCandidateId` and the turn) and moves the candidate's votes **in every district** by the `redistribution` shares. `_abstain` is not a candidate: those votes return to the undecided ("bizonytalan") pool, so the number of eligible voters stays the same while the number of valid votes can drop. Shares must be between 0 and 1 and add up to 1; targets must be other candidates in `parties`. Votes are rounded per district with the largest remainder method (ties go to the target that comes first alphabetically), so no voter is created or lost.

From then on the candidate cannot win, receives no votes from answer effects, strategy rewards or later events (their keys are dropped from those effects), and is left out of the polls. The validator refuses to withdraw a playable candidate until the product rule for that case is decided. The ratios in the example above are a design placeholder, not historical data.

##### Conditions

A `Condition` ([shared/types/condition.ts](shared/types/condition.ts)) is either a logical combination or a single check; combinations can be nested freely.

| Shape                                                                             | Met when                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{ "and": Condition[] }` / `{ "or": Condition[] }` / `{ "not": Condition }`       | every child / at least one child / the child is not met. `and` and `or` must not be empty.                                                                                                                                                               |
| `{ "type": "turn", "min"?: number, "max"?: number }`                              | the number of answered decisions is within `min`–`max`, both ends included. At least one bound is required.                                                                                                                                              |
| `{ "type": "candidate-support", "candidateId", "operator", "value" }`             | the candidate's current city-wide (mayoral) or candidate-list (parliamentary) share compares to `value` (a share between 0 and 1) with `<`, `<=`, `>`, `>=`. A candidate without valid votes has 0; an id that is not in `parties` is an error, never 0. |
| `{ "type": "answer-selected", "questionId", "answerId" }`                         | that answer was given to that question, including on the current turn.                                                                                                                                                                                   |
| `{ "type": "candidate-status", "candidateId", "status": "active" \| "inactive" }` | the candidate currently has that status.                                                                                                                                                                                                                 |
| `{ "type": "event-triggered", "eventId" }`                                        | that event has already run.                                                                                                                                                                                                                              |

The campaign validator reports unknown questions, answers, candidates and events inside conditions, as well as malformed conditions.
