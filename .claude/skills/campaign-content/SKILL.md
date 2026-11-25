---
name: campaign-content
description: Draft and review Kampánykörút campaign data, events, questions, answer effects, focus trees, and political copy using this repository's schemas and tone. Use for campaign content work, especially historical or politically sensitive material.
---

# Kampánykörút campaign content

Create campaign content that fits the existing game data and the selected campaign's world. Do not invent new mechanics or silently change the meaning of existing mechanics.

## Before drafting

1. Read `.ai/AGENTS.md` and the relevant campaign's `manifest.json`.
2. Resolve data paths from the manifest. The campaign's public ID, folder route, party IDs, candidate IDs, question IDs, and answer IDs are distinct values; copy the exact IDs from their source files.
3. Inspect neighboring content for language, length, naming, and formatting conventions.
4. For a reality-grounded historical claim, use the existing `$factchk` skill when available. Keep deliberate alternate-history fiction distinct from claims about actual events.
5. If the requested mechanic is not present in the type definitions or neighboring content, describe the gap and ask whether the user wants a code change before proposing data that assumes it exists.

## Drafting rules

- Write player-facing Hungarian in natural, concise language unless the user asks for another language.
- Keep news headlines short and distinguishable at a glance.
- Make each answer a real trade-off or a clearly intentional flavor choice; avoid options that differ only in wording.
- Preserve the campaign's established timeline, party positions, character relationships, and alternate-history assumptions.
- Treat political persuasion as game fiction. Do not present campaign claims as neutral historical fact.
- Keep data changes scoped to the requested campaign and files.
- Preserve JSON formatting and existing IDs. Do not reformat unrelated campaign data.

## Output

When asked to create or edit content, make the requested change in the campaign data files. Summarize the files changed and flag any factual or design assumptions that need the author's decision. When asked only to brainstorm, return clearly labeled options without editing files.
