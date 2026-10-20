# Telepítés: játék, campaign-api és MongoDB

A szerveren (`/opt/kampanykorut`) egy `docker compose` futtatja az éles és a dev
környezetet. Az appoknak (játék, campaign-api) külön verziójuk van, és külön
is települnek: egy deploy csak a saját szolgáltatását húzza le és indítja újra.

| Image                                                 | Mikor készül           | Tagek                         |
| ----------------------------------------------------- | ---------------------- | ----------------------------- |
| `ghcr.io/cyclopscatstudios/kampanykorut`              | push a `dev`-re        | `dev`, `dev-<sha>`            |
| `ghcr.io/cyclopscatstudios/kampanykorut`              | `kampanykorut` release | `<verzió>`, `latest`, `<sha>` |
| `ghcr.io/cyclopscatstudios/kampanykorut/campaign-api` | push a `dev`-re        | `dev`, `dev-<sha>`            |
| `ghcr.io/cyclopscatstudios/kampanykorut/campaign-api` | `campaign-api` release | `<verzió>`, `latest`, `<sha>` |

A játék nginxe a `/api/`, `/news` és `/webhooks/` kéréseket az
`API_UPSTREAM` címre küldi. Ha a backend nem érhető el, a `/news` oldalakat a
játék saját oldalai szolgálják ki, a hírek pedig nem jelennek meg.

## Kiadás és deploy

```
feature_* ──PR──▶ dev ──▶ CI ──▶ image dev-<sha> ──▶ *-dev szolgáltatás
                   │
                   └──PR (merge commit)──▶ master ──▶ release-please „chore: release” PR
                                                            │ merge
                                                            ▼
                                     tag + GitHub Release ──▶ image <verzió> ──▶ éles szolgáltatás
```

- A `master`-re mergelés még nem élesít. A [Release](../.github/workflows/release.yml)
  workflow nyit (vagy frissít) egy release PR-t, amely appokként emeli a
  `package.json` verzióját és írja a `CHANGELOG.md`-t. **Ennek a PR-nek a
  mergelése az élesítés.**
- A verziót a commitüzenetek határozzák meg
  ([Conventional Commits](https://www.conventionalcommits.org/)): `fix:` →
  patch, `feat:` → minor (1.0 előtt), `feat!:` vagy `BREAKING CHANGE:` →
  major (1.0 után). A `chore:`, `docs:`, `test:`, `ci:` commitok nem
  hoznak létre releaset.
- Egy commit ahhoz az apphoz tartozik, amelynek a mappájában (`apps/<app>`)
  fájlt módosít. Ha egy commit csak a `shared/` mappát vagy gyökérfájlokat
  érint, egyik appnál sem indít releaset.
- A `dev` → `master` PR-t merge committal kell mergelni, ne squash-sel,
  különben a release-please csak egyetlen commitot lát.
- Konkrét verzió (például az 1.0-s élesítéskor): a
  [`release-please-config.json`](../release-please-config.json)-ban az adott
  csomaghoz `"release-as": "1.0.0"`, majd a release után ki kell venni.
- A tageket a release-please hozza létre: `kampanykorut-v0.2.0`,
  `campaign-api-v0.2.1`.

A deploy SSH-n beírja a verziót a szerver `.env` fájljába (lásd lent), majd
`docker compose pull <szolgáltatás> && docker compose up -d --no-deps <szolgáltatás>`
parancsot futtat.

### Visszaállás

Actions → **Rollback** → app és verzió (például `0.3.1`). Ez ugyanazt a
deployt futtatja egy korábbi image-dzsel. A futó verzió:

- játék: főmenü alja (`v0.3.1 · <commit>`);
- campaign-api: `GET /health` → `version`, `commit`.

## Egyszeri beállítás

### GitHub

- Két GitHub App kell, mert egy Appnak egy webhook URL-je lehet:
  egy az éles, egy a dev környezetnek. Mindkettő:
  - jogosultság: `Discussions: Read-only` és `Issues: Read and write`;
  - esemény: `Discussion` és `Issues` (az `Issues` csak a jogosultság
    mentése után jelenik meg);
  - webhook URL: `https://<környezet címe>/webhooks/github`, saját secrettel;
  - telepítve a `kampanykorut` repóra.
- Jogosultság bővítése után a telepítésnél (_Settings → Installations_) el
  kell fogadni az új jogosultságokat; addig a régiek érvényesek, és az
  issue-nyitás `403`-at kap.
- A repóban a Discussions be van kapcsolva, és van egy **Hírek** kategória
  Announcement formátummal. A hírek írásáról: [hirek-irasa.md](hirek-irasa.md).
- Címkék a hibabejelentésekhez: `bug`, `from-app`, `has-contact`.

### Hibabejelentés: Gmail és Turnstile

- **Gmail fiók** (pl. `kampanykorut.hibajelentes@gmail.com`): kétlépcsős
  azonosítás, majd _Google-fiók → Biztonság → Alkalmazásjelszavak_. Ez a
  `SMTP_USER` és az `SMTP_APP_PASSWORD`. A napi kb. 500 címzettes korlát elég.
- **Port teszt a szerverről**, mielőtt a levelezést élesítjük:
  `nc -zv smtp.gmail.com 465` és `nc -zv smtp.gmail.com 587`. Ha a 465 zárt,
  de az 587 nyitva, `SMTP_PORT=587`. Induláskor a backend ki is próbálja a
  kapcsolatot, és naplózza: `SMTP connection verified` vagy
  `SMTP connection check failed`.
- **Turnstile:** Cloudflare → Turnstile → új site a `kampanykorut.hu`
  domainre (és a dev címre). A site key a játék buildjébe kerül: GitHub
  _Settings → Secrets and variables → Actions → Variables_ alatt
  `VITE_TURNSTILE_SITE_KEY` (nyilvános érték, ezért változó, nem secret). A
  secret key a backend env fájljába (`TURNSTILE_SECRET_KEY`).
- A „javítva” levél akkor megy ki, ha a bejelentő megerősítette a címét, és az
  issue-t _Close as completed_ okkal zárod (kézzel, vagy `Fixes #123`
  commit/PR mergelésével). A _not planned_ és _duplicate_ lezárásról nem megy
  levél. A kimaradt webhookokat egy napi job pótolja.

### Konténer-registry

Ha a ghcr.io csomagok privátak, a szerveren egyszer be kell lépni:
`docker login ghcr.io` (egy `read:packages` jogú tokennel).

## compose

```yaml
services:
  kampanykorut:
    image: ghcr.io/cyclopscatstudios/kampanykorut:${KAMPANYKORUT_VERSION:-latest}
    restart: unless-stopped
    ports:
      - "3000:80"
    environment:
      API_UPSTREAM: http://campaign-api:4000
    depends_on:
      - campaign-api

  campaign-api:
    image: ghcr.io/cyclopscatstudios/kampanykorut/campaign-api:${CAMPAIGN_API_VERSION:-latest}
    restart: unless-stopped
    env_file: ./campaign-api.env
    environment:
      MONGODB_URI: mongodb://mongo:27017/kampanykorut
      ASSETS_DIR: /app/data/assets
    volumes:
      - campaign-api-assets:/app/data/assets
    depends_on:
      - mongo

  mongo:
    image: mongo:8
    restart: unless-stopped
    volumes:
      - mongo-data:/data/db

  kampanykorut-dev:
    image: ghcr.io/cyclopscatstudios/kampanykorut:${KAMPANYKORUT_DEV_VERSION:-dev}
    restart: unless-stopped
    ports:
      - "3001:80"
    environment:
      API_UPSTREAM: http://campaign-api-dev:4000
    depends_on:
      - campaign-api-dev

  campaign-api-dev:
    image: ghcr.io/cyclopscatstudios/kampanykorut/campaign-api:${CAMPAIGN_API_DEV_VERSION:-dev}
    restart: unless-stopped
    env_file: ./campaign-api-dev.env
    environment:
      MONGODB_URI: mongodb://mongo-dev:27017/kampanykorut
      ASSETS_DIR: /app/data/assets
    volumes:
      - campaign-api-dev-assets:/app/data/assets
    depends_on:
      - mongo-dev

  mongo-dev:
    image: mongo:8
    restart: unless-stopped
    volumes:
      - mongo-dev-data:/data/db

volumes:
  campaign-api-assets:
  mongo-data:
  campaign-api-dev-assets:
  mongo-dev-data:
```

- A portokat a mostani beállításhoz igazítsd; a backendnek és a Mongónak nem
  kell port, a játék nginxe a compose belső hálózatán éri el őket.
- Az nginx a Docker belső DNS-ét használja (`NGINX_RESOLVER`, alapértéke
  `127.0.0.11`); más környezetben ezt is meg kell adni.

## Env fájlok

`campaign-api.env` (éles) és `campaign-api-dev.env` (dev), a compose mellett,
`chmod 600` jogokkal. Ezek titkokat tartalmaznak, a repóba nem kerülhetnek.

```
SITE_URL=https://kampanykorut.hu
API_DOCS_ENABLED=false
GITHUB_APP_ID=...
GITHUB_APP_INSTALLATION_ID=...
GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----
GITHUB_WEBHOOK_SECRET=...
SMTP_USER=kampanykorut.hibajelentes@gmail.com
SMTP_APP_PASSWORD=...
TURNSTILE_SECRET_KEY=...
BUG_REPORT_IP_SALT=...
```

- A `SITE_URL` a környezet nyilvános címe; ebből készülnek a megosztási és
  kanonikus linkek, valamint a levelekben lévő megerősítő és leiratkozó linkek.
- A `TRUST_PROXY` az image-ben `1`: a backend csak a közvetlenül előtte álló
  nginxben bízik, így a kliens nem tud hamis IP-t írni az `X-Forwarded-For`
  fejlécbe (erre épül a hibabejelentések IP-alapú korlátja). Ha az nginx elé
  Cloudflare proxy kerül, `TRUST_PROXY=2` kell.
- A `BUG_REPORT_IP_SALT` egy véletlen érték (`openssl rand -hex 32`); nélküle
  minden újraindításkor új só készül.
- A privát kulcs egy sorban, `\n`-nel a sortörések helyén.
- Az éles fájlba az éles App, a dev fájlba a dev App adatai kerülnek.
- Éles módban a `MONGODB_URI` kötelező; nélküle a backend el sem indul.

Teljes lista és alapértékek: [`apps/campaign-api/.env.example`](../apps/campaign-api/.env.example).

### Verziók (`.env`)

A compose mellett lévő `.env` mondja meg, melyik image fut. A deploy és a
rollback workflow írja, kézzel csak az első beállításkor kell:

```
KAMPANYKORUT_VERSION=0.1.0
CAMPAIGN_API_VERSION=0.1.0
KAMPANYKORUT_DEV_VERSION=dev
CAMPAIGN_API_DEV_VERSION=dev
```

Ha egy sor hiányzik, a compose a `latest`, illetve a `dev` taget használja.
Az első release előtt nincs verziószámos image, ezért addig ezek maradjanak
`latest`-en, illetve `dev`-en, vagy a sor el is hagyható.

## Képek

Az `ASSETS_DIR` beállítással a képek a `campaign-api-assets` volume-ra
kerülnek, és a backend szolgálja ki őket a `/api/v1/assets/` alatt. A képek
a GitHubról bármikor újramásolhatók: ha a volume elveszik, a következő
szinkron (induláskor vagy 15 percen belül) pótolja őket.

Ha később CDN kell, az `S3_*` és `ASSETS_PUBLIC_URL` változókkal Cloudflare
R2-re vagy S3-ra lehet váltani; ilyenkor az `ASSETS_DIR` elhagyható.

## Mentés

A hírek a GitHubon is megvannak, de a MongoDB-t érdemes naponta menteni, mert
később a kampányok is ide kerülnek. Például cronból:

```sh
cd /opt/kampanykorut
docker compose exec -T mongo mongodump --archive --gzip \
  > /backup/mongo-$(date +%F).gz
find /backup -name 'mongo-*.gz' -mtime +14 -delete
```

Visszaállítás: `docker compose exec -T mongo mongorestore --archive --gzip --drop < /backup/mongo-<dátum>.gz`.

## Ellenőrzés

- `https://<cím>/api/v1/news`: JSON a hírekkel.
- `https://<cím>/news`: szerveren renderelt hírlista.
- `docker compose exec campaign-api wget -qO- localhost:4000/ready`: a `mongo`
  és a `storage` is `ok`.
- A GitHub App _Advanced_ fülén a webhook-kézbesítések 204-es választ kapnak.
- Első éles kiadás után:
  - egy hír linkje a [Facebook Sharing Debuggerben](https://developers.facebook.com/tools/debug/)
    képpel és címmel jelenik meg;
  - a Google Search Console-ban beadva a `https://kampanykorut.hu/news/sitemap.xml`.

## Hibakeresés

- **Webhook:** `yarn workspace campaign-api webhook:test <URL>` aláírt `ping` eseményt küld a `GITHUB_WEBHOOK_SECRET`-tel, és a válaszkódból megmondja a hibát (rossz secret, hiányzó útvonal, nem futó backend). Pl. `GITHUB_WEBHOOK_SECRET=... yarn workspace campaign-api webhook:test https://kampanykorut.hu/webhooks/github`. Sikeres eredmény: 202. A GitHub App _Advanced → Recent Deliveries_ listájában a valódi kézbesítések látszanak, és újra is küldhetők (_Redeliver_).
- **A backend nem indul, `GITHUB_APP_PRIVATE_KEY` hibával:** a kulcs nem
  olvasható. Egy sorba kell írni, `\n`-nel a sortörések helyén. A letöltött
  `.pem` fájlból ez kiírja a `.env`-be való sort:

  ```sh
  yarn workspace campaign-api key:env C:/Users/<név>/Downloads/kulcs.pem
  ```

- **A hírek nem jelennek meg:** `docker compose logs campaign-api`. Ha
  `Initial news sync failed` szerepel benne, a GitHub App adatai vagy
  jogosultságai hibásak.
- **Nincs kép:** a `/ready` válaszában a `storage` értéke `fail`, vagy a
  logban `Could not copy news image` szerepel.
- **A változás nem jelenik meg azonnal:** a hírek API-ja és oldalai 5 percig
  cache-elhetők; a webhook nélküli környezetben a szinkron 15 percenként fut.
