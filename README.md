# Kampánykörút monorepo

Yarn (Classic v1) workspaces monorepo.

## Apps

- [`apps/kampanykorut`](apps/kampanykorut) — the Kampánykörút election simulation game (see its README for details).
- [`apps/campaign-maker`](apps/campaign-maker) — campaign authoring tool (new, minimal scaffold).

## Getting started

```bash
corepack enable        # ensures Yarn Classic 1.22.x is used (see root package.json "packageManager")
yarn install            # installs all workspaces from the repo root

yarn workspace kampanykorut dev      # http://localhost:3000
yarn workspace campaign-maker dev    # http://localhost:5173 (Vite default)
```

See [LICENSE](LICENSE).
