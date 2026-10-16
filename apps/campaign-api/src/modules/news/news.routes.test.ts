import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type App, buildApp } from "../../app";
import { loadConfig } from "../../config/env";
import { newsRecord } from "./__fixtures__/news";
import { InMemoryNewsRepository } from "./news.repository";

const config = loadConfig({ NODE_ENV: "test", LOG_LEVEL: "silent" });

describe("news routes", () => {
  let app: App;
  let repository: InMemoryNewsRepository;

  beforeEach(async () => {
    repository = new InMemoryNewsRepository();
    app = await buildApp(config, { newsRepository: repository });
  });

  afterEach(async () => {
    await app.close();
  });

  it("lists the latest news with cache headers", async () => {
    await repository.upsert(
      newsRecord({
        number: 3,
        cover: {
          large16x9Url: "https://cdn.test/news/a/cover-16x9.webp",
          thumbUrl: "https://cdn.test/news/a/thumb.webp",
        },
        cta: { label: "Kipróbálom →", url: "https://kampanykorut.hu" },
      }),
    );
    await repository.upsert(newsRecord({ number: 2 }));

    const res = await app.inject({
      method: "GET",
      url: "/api/v1/news?limit=4",
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["cache-control"]).toBe("public, max-age=300");
    expect(res.headers.etag).toMatch(/^".+"$/);
    expect(res.json()).toEqual({
      items: [
        {
          number: 3,
          title: "Hír 3",
          type: "frissites",
          lang: "hu",
          lead: "Rövid bevezető.",
          cover: {
            large16x9Url: "https://cdn.test/news/a/cover-16x9.webp",
            thumbUrl: "https://cdn.test/news/a/thumb.webp",
          },
          cta: { label: "Kipróbálom →", url: "https://kampanykorut.hu" },
          url: "https://github.com/cyclopscatstudios/kampanykorut/discussions/3",
          isPinned: false,
          publishedAt: "2026-10-03T00:00:00.000Z",
          updatedAt: "2026-10-03T00:00:00.000Z",
          expiresAt: null,
        },
        expect.objectContaining({ number: 2 }),
      ],
    });
    expect(res.body).not.toContain("<p>");
  });

  it("falls back to Hungarian when there is no news in the requested language", async () => {
    await repository.upsert(newsRecord({ number: 1 }));

    const fallback = await app.inject({
      method: "GET",
      url: "/api/v1/news?lang=en",
    });
    await repository.upsert(newsRecord({ number: 2, lang: "en" }));
    const english = await app.inject({
      method: "GET",
      url: "/api/v1/news?lang=en",
    });
    const archive = await app.inject({
      method: "GET",
      url: "/api/v1/news/archive?lang=en",
    });

    expect(fallback.json()).toMatchObject({
      items: [{ number: 1, lang: "hu" }],
    });
    expect(english.json()).toMatchObject({
      items: [{ number: 2, lang: "en" }],
    });
    expect(archive.json()).toMatchObject({ items: [{ number: 2 }] });
  });

  it("answers 304 when the ETag still matches", async () => {
    await repository.upsert(newsRecord());
    const first = await app.inject({ method: "GET", url: "/api/v1/news" });

    const res = await app.inject({
      method: "GET",
      url: "/api/v1/news",
      headers: { "if-none-match": first.headers.etag as string },
    });

    expect(res.statusCode).toBe(304);
    expect(res.body).toBe("");
  });

  it("validates the query", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/news?limit=99",
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ errors: [{ path: "/limit" }] });
  });

  it("pages the archive with a cursor and a type filter", async () => {
    for (const number of [1, 2, 3]) {
      await repository.upsert(newsRecord({ number }));
    }
    await repository.upsert(newsRecord({ number: 4, type: "kampany" }));

    const first = await app.inject({
      method: "GET",
      url: "/api/v1/news/archive?limit=2&type=frissites",
    });
    const { items, nextCursor } = first.json();
    const second = await app.inject({
      method: "GET",
      url: `/api/v1/news/archive?limit=2&type=frissites&cursor=${nextCursor}`,
    });

    expect(items.map((n: { number: number }) => n.number)).toEqual([3, 2]);
    expect(second.json()).toMatchObject({
      items: [{ number: 1 }],
      nextCursor: null,
    });
  });

  it("rejects a malformed cursor", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/news/archive?cursor=bm9wZQ",
    });

    expect(res.statusCode).toBe(400);
  });

  it("returns one news item with its HTML", async () => {
    await repository.upsert(newsRecord({ number: 7, html: "<p>Teljes</p>" }));

    const res = await app.inject({ method: "GET", url: "/api/v1/news/7" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ number: 7, html: "<p>Teljes</p>" });
  });

  it("answers 404 for missing or hidden news", async () => {
    await repository.upsert(newsRecord({ number: 8, visible: false }));

    const hidden = await app.inject({ method: "GET", url: "/api/v1/news/8" });
    const missing = await app.inject({ method: "GET", url: "/api/v1/news/9" });

    expect(hidden.statusCode).toBe(404);
    expect(missing.statusCode).toBe(404);
    expect(missing.headers["content-type"]).toContain(
      "application/problem+json",
    );
  });
});

describe("news routes in development", () => {
  it("asks the browser to revalidate on every request", async () => {
    const app = await buildApp(
      loadConfig({ NODE_ENV: "development", LOG_LEVEL: "silent" }),
      { newsRepository: new InMemoryNewsRepository() },
    );

    try {
      const res = await app.inject({ method: "GET", url: "/api/v1/news" });
      expect(res.headers["cache-control"]).toBe("no-cache");
    } finally {
      await app.close();
    }
  });
});
