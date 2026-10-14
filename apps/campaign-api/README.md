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
