# campaign-api

Backend service for Kampánykörút: stores, validates, reviews and serves
campaign bundles for the game (`apps/kampanykorut`) and the campaign maker
(`apps/campaign-maker`).

Stack: Node.js 24, TypeScript, Fastify 5, TypeBox route schemas, Zod-validated
configuration, OpenAPI via `@fastify/swagger`.

## Development

```sh
cp apps/campaign-api/.env.example apps/campaign-api/.env
yarn api          # build in watch mode and restart on change
yarn test:api     # unit + integration tests (Vitest, fastify.inject)
yarn build:api    # bundle to apps/campaign-api/dist
```

The server listens on `http://localhost:4000` by default.

| Path                | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `/health`           | Liveness probe                                 |
| `/ready`            | Readiness probe (database, storage once added) |
| `/api/v1/docs`      | Swagger UI (when `API_DOCS_ENABLED=true`)      |
| `/api/v1/docs/json` | OpenAPI spec                                   |
| `/api/v1/*`         | Feature endpoints                              |

Errors are returned as RFC 9457 `application/problem+json`; validation errors
include the JSON pointer of each invalid field in `errors[].path`.

## Build notes

`shared/domain` uses tsyringe decorators with emitted metadata, which esbuild
cannot produce. `tsup` therefore transpiles through `@swc/core` (enabled by
`emitDecoratorMetadata` in `tsconfig.json`), and `src/server.ts` imports
`reflect-metadata` first. Imported `shared/` code is bundled into `dist/`.

## Docker

Build from the repository root so `shared/` is in the context:

```sh
docker build -f apps/campaign-api/Dockerfile -t kampanykorut-api .
docker run --rm -p 4000:4000 kampanykorut-api
```

The runtime image contains only the API's production dependencies.
Secrets are never baked into the image; pass them as environment variables.

## GitHub integration

The news box is fed from GitHub Discussions, read through a GitHub App
installation (`src/integrations/github`). One-time setup, no code involved:

1. **Repository → Settings → Features:** enable Discussions.
2. **Discussions → Categories → New category:** name `Hírek`, format
   **Announcement** (only maintainers can open topics, players can comment).
3. **GitHub App** (the same app the bug reports use; create it under the
   organization if it does not exist yet):
   - Repository permissions: `Discussions: Read-only` (plus `Metadata: Read-only`,
     which GitHub adds automatically).
   - Subscribe to events: `Discussion`.
   - Install it on the `kampanykorut` repository only.
4. Put the credentials into `.env`:
   - `GITHUB_APP_ID`: App settings → _App ID_.
   - `GITHUB_APP_PRIVATE_KEY`: App settings → _Generate a private key_.
   - `GITHUB_APP_INSTALLATION_ID`: the number at the end of the installation
     URL (`/settings/installations/<id>`).

The news category is looked up by `GITHUB_NEWS_CATEGORY` (name or slug), so its
node ID never has to be copied by hand.
