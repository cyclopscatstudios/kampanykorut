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

Deployment with the game, MongoDB and the GitHub Apps (in Hungarian): [docs/telepites.md](../../docs/telepites.md).

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
   - Webhook URL: `https://<api-host>/webhooks/github`, content type
     `application/json`, with a random secret (`openssl rand -hex 32`).
   - Subscribe to events: `Discussion`.
   - Install it on the `kampanykorut` repository only.
4. Put the credentials into `.env`:
   - `GITHUB_APP_ID`: App settings → _App ID_.
   - `GITHUB_APP_PRIVATE_KEY`: App settings → _Generate a private key_.
   - `GITHUB_APP_INSTALLATION_ID`: the number at the end of the installation
     URL (`/settings/installations/<id>`).
   - `GITHUB_WEBHOOK_SECRET`: the webhook secret from step 3.

The news category is looked up by `GITHUB_NEWS_CATEGORY` (name or slug), so its
node ID never has to be copied by hand.

### News sync

Authoring rules for the news discussions (in Hungarian): [docs/hirek-irasa.md](../../docs/hirek-irasa.md).

- `POST /webhooks/github` verifies `X-Hub-Signature-256` and dispatches events
  to the registered handlers. For `discussion` events in the news category (or
  for news that already exist), the discussion is re-fetched over GraphQL and
  stored or hidden.
- On startup a full sync pages through the whole category and hides stored
  news that no longer exist there. Every `NEWS_SYNC_INTERVAL_MINUTES` the
  latest 20 discussions are re-synced to recover missed webhooks.
- Parsing rules: type from the `uj-funkcio` / `frissites` / `kampany` /
  `javitas` label, `lang:en` label for English, first image is the cover,
  first paragraph is the lead, a last paragraph that is a single link is the
  CTA, and a trailing `lejár: YYYY-MM-DD` line sets the expiry (end of that day,
  Budapest time). Closed discussions are hidden.

### News storage, images and API

- With `MONGODB_URI` set, news live in the `news` collection (unique
  `githubId` and `number`); without it they are kept in memory and refilled by
  the startup sync. `/ready` then also checks MongoDB.
- With the `S3_*` variables set, the first image becomes a 1200×675 WebP cover
  and a 320×320 thumbnail, other images a WebP of at most 1200 px width, under
  `news/<hash of source URL>/`. Images that fail to copy are left out and
  retried on the next sync; GitHub attachment URLs are never served.
- Without `S3_*` in development, images are written to `.data/assets` and
  served by the API under `/api/v1/assets/`. `ASSETS_DIR` does the same in any
  environment (the image prepares a writable `/app/data/assets` for a volume);
  otherwise news are shown without images.
- The markdown is rendered with `markdown-it` and cleaned with `sanitize-html`
  (paragraphs, emphasis, lists, links, images, h2/h3, blockquote). External
  links get `target="_blank" rel="noopener noreferrer"`.

| Path                       | Purpose                                                             |
| -------------------------- | ------------------------------------------------------------------- |
| `GET /api/v1/news`         | Visible, not expired news, pinned first; `?limit=` (≤ 20), `?lang=` |
| `GET /api/v1/news/archive` | All published news incl. expired; `?limit=`, `?type=`, `?cursor=`   |
| `GET /api/v1/news/:number` | One news item with its sanitized `html`                             |

The read endpoints send `Cache-Control: public, max-age=300` and an `ETag`.
`?lang=en` falls back to Hungarian while there are no visible English news.

### Server-rendered news pages

Search engines and link previews (Facebook, Messenger) do not run the SPA, so
the API also renders plain HTML pages with Open Graph tags and `NewsArticle`
structured data. Links point to `SITE_URL`.

| Path                    | Purpose                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `GET /news`             | News list; `?type=feature\|update\|campaign\|fix`, `?cursor=` |
| `GET /news/:number`     | One news item; hidden or missing news answer a `noindex` 404  |
| `GET /news/sitemap.xml` | Sitemap of all published news (listed in `robots.txt`)        |

The game's nginx (`apps/kampanykorut/nginx.conf`) forwards `/news`, `/api/`
and `/webhooks/` to `API_UPSTREAM` (default `http://campaign-api:4000`,
resolved through `NGINX_RESOLVER`, default Docker DNS `127.0.0.11`). When the
API is unreachable, `/news` falls back to the SPA's own news pages.
