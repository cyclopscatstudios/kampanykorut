# Kampánykörút MCP server

This local MCP server gives compatible coding assistants read-only access to the game's campaign data and election engine. It does not edit campaign files, saved games, or the active browser session.

## Setup

From the repository root:

```bash
corepack yarn install
```

The repository root `.mcp.json` configures the server for Claude Code. Restart Claude Code after installing dependencies; if it asks whether to trust the project MCP server, approve it to enable the tools.

You can also start it manually with:

```bash
corepack yarn campaign-mcp
```

## Tools

- `list_campaigns`: list campaigns, playable sides, and candidates.
- `inspect_campaign_question`: inspect questions and answer effects for one campaign side and candidate.
- `validate_campaign`: run the same campaign-data validator used by the repository.
- `simulate_campaign`: run repeatable scenarios through the production domain engine. It supports `first`, `last`, and seeded uniform `random` answer selection, plus an `answerPlan` for fixed answers. Each call is capped at 5,000 runs.

Simulation results are game-engine outputs, not predictions of voter behavior. The simulator does not model district visits, district boosts, or human strategy.
