# Campaign Maker narrative beta contract

Baseline: local `origin/dev` commit `c3db267a00d1d5671725cde3eb329361cb6a3579` (remote freshness unverified).
Implementation branch/worktree: `cyc-10-campaign-maker-beta` in the task-managed `_default/repo` worktree.
Starter: shipped `2026_tavaszi-szel`, because it is the smallest complete schema-v1 campaign with one playable side/candidate and questions, answers, effects, feedback, and candidate-specific endings. Public use remains conditional on owner review of its rights, credits, political-content classification, and wording.

## Envelope and limits

The downloadable/importable artifact is one UTF-8 JSON document with this editor envelope:

```json
{
  "format": "kampanykorut-campaign-bundle",
  "formatVersion": 1,
  "campaignId": "local-safe-id",
  "route": "local-safe-route",
  "files": { "manifest.json": { "schemaVersion": 1 } },
  "assetPaths": ["/images/existing-starter-asset.png"]
}
```

`files` maps safe, relative, normalized paths to parsed JSON values. Export sorts paths recursively and ends with one newline. It contains no editor state, code, HTML, remote URLs, or uploaded binary assets. `assetPaths` only declares existing same-origin starter assets so the canonical validator can check references. Schema v1 is the only accepted campaign schema and envelope version 1 is the only accepted envelope version.

Import is staged and must pass structural/package checks and the shared campaign validator before it can replace a draft. Limits: 2 MiB envelope; 64 files; 512 KiB serialized JSON per file; path length 180; nesting depth 30; 25 questions; 6 answers per question; 20,000 characters per narrative text; safe campaign IDs/routes of 1–64 lowercase ASCII letters, digits, `_` or `-`. Absolute paths, drive paths, `.`/`..`, empty segments, backslashes, duplicate normalized paths, prototype keys, non-finite values, and unsupported/future versions are rejected.

## Editable and preserved data

Editable fields are intentionally one-side and template-constrained:

- campaign title/year and existing party labels/colors/list-vote baselines;
- the one existing playable side label/description and its one playable candidate label/description;
- question ID/title/body and 2–6 answer IDs/labels, up to 25 questions;
- answer advisor feedback text;
- one `uniform-swing` effect map per answer, using existing party IDs and finite values from -10 through +10;
- candidate-specific victory, defeat and deadlock title/subtitle/description.

The electoral/district/voter baseline, manifest layout, district/candidate results, image paths/assets, pollsters, advisor assets, root fallback endings, playable-side/candidate IDs, and all other supported/unknown JSON fields are locked and preserved. Removing/renaming parties is excluded because those IDs are referenced throughout the locked baseline. Imported content outside the editable overlay is retained semantically on export. A validator error in locked content identifies the file/path and tells the creator to restore the starter or choose a supported bundle.

## Persistence and conflicts

Draft records are namespaced/versioned in local storage and retain the full envelope plus editor metadata. Autosave exposes saving/saved/failed state; failures keep in-memory data and leave export available. Corrupt records are not replaced: their raw text is offered for recovery download or explicit deletion. Drafts are discoverable, reopenable, exportable, and deletable with confirmation. Import creates a new draft unless the creator explicitly confirms replacement. Concurrent tabs use revision/updated-at comparison; a stale tab stops autosaving and asks the creator to reload or save a recovery export.

Preview data uses separate random IDs and storage keys, expires after 30 minutes, and is deleted on successful load/explicit return where practical. Preview never edits the source draft, registers a shipped mode, or clears shared storage. HTTP loading remains the game default.

## Estimate and uncertainty

Revised implementation estimate for backlog items 1–5 is **25–40 engineering working days** for one developer, plus independent QA and owner/editorial/legal/device review. Confidence is low-to-medium until shared-loader preview integration and browser execution are proven. Main uncertainty is same-runtime preview/routing (5–9 days), resilient persistence/import and recovery (6–10), narrative/reference-safe UI (7–11), and accessibility/hosting/regression completion (5–8); contract/fixtures are 2 days. This is a sizing range, not a calendar commitment.
