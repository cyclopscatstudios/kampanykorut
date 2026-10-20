import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type App, buildApp } from "../../app";
import { loadConfig } from "../../config/env";
import { newsRecord } from "./__fixtures__/news";
import { InMemoryNewsRepository } from "./news.repository";

const config = loadConfig({
  NODE_ENV: "test",
  LOG_LEVEL: "silent",
  SITE_URL: "https://kampanykorut.hu",
});

function jsonLdOf(html: string) {
  const match = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(
    html,
  );
  return JSON.parse(match![1]!);
}

describe("news pages", () => {
  let app: App;
  let repository: InMemoryNewsRepository;

  beforeEach(async () => {
    repository = new InMemoryNewsRepository();
    app = await buildApp(config, { newsRepository: repository });
  });

  afterEach(async () => {
    await app.close();
  });

  it("renders a shareable detail page with Open Graph and NewsArticle data", async () => {
    await repository.upsert(
      newsRecord({
        number: 7,
        title: "Megérkezett a Mod-készítő",
        type: "uj-funkcio",
        lead: "Saját kampányok, linkkel.",
        html: "<p>Teljes szöveg.</p>",
        cover: {
          large16x9Url: "/api/v1/assets/news/a/cover-16x9.webp",
          thumbUrl: "/api/v1/assets/news/a/thumb.webp",
        },
        cta: { label: "Kipróbálom →", url: "https://kampanykorut.hu/menu" },
      }),
    );

    const res = await app.inject({ method: "GET", url: "/news/7" });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(res.headers["cache-control"]).toBe("public, max-age=300");
    expect(res.body).toContain(
      "<title>Megérkezett a Mod-készítő – Kampánykörút</title>",
    );
    expect(res.body).toContain(
      '<link rel="canonical" href="https://kampanykorut.hu/news/7">',
    );
    expect(res.body).toContain('<meta property="og:type" content="article">');
    expect(res.body).toContain(
      '<meta property="og:image" content="https://kampanykorut.hu/api/v1/assets/news/a/cover-16x9.webp">',
    );
    expect(res.body).toContain(
      '<meta property="og:description" content="Saját kampányok, linkkel.">',
    );
    expect(res.body).toContain('<span class="badge">Új funkció</span>');
    expect(res.body).toContain("<p>Teljes szöveg.</p>");
    expect(res.body).toContain(
      '<a class="cta" href="https://kampanykorut.hu/menu">',
    );
    expect(jsonLdOf(res.body)).toMatchObject({
      "@type": "NewsArticle",
      headline: "Megérkezett a Mod-készítő",
      image: ["https://kampanykorut.hu/api/v1/assets/news/a/cover-16x9.webp"],
      mainEntityOfPage: "https://kampanykorut.hu/news/7",
    });
  });

  it("escapes text from GitHub in markup and structured data", async () => {
    await repository.upsert(
      newsRecord({
        number: 8,
        title: '"><script>alert(1)</script></script>',
        lead: "<img src=x onerror=alert(1)>",
      }),
    );

    const res = await app.inject({ method: "GET", url: "/news/8" });

    expect(res.body).not.toContain("<script>alert(1)");
    expect(res.body).not.toContain("<img src=x");
    expect(res.body).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(jsonLdOf(res.body).headline).toBe(
      '"><script>alert(1)</script></script>',
    );
  });

  it("answers 404 with a noindex page for missing, hidden or invalid news", async () => {
    await repository.upsert(newsRecord({ number: 9, visible: false }));

    for (const url of ["/news/9", "/news/404", "/news/abc"]) {
      const res = await app.inject({ method: "GET", url });
      expect(res.statusCode).toBe(404);
      expect(res.headers["content-type"]).toBe("text/html; charset=utf-8");
      expect(res.body).toContain('<meta name="robots" content="noindex">');
    }
  });

  it("lists news with type filters and crawlable pagination", async () => {
    for (let number = 1; number <= 14; number++) {
      await repository.upsert(newsRecord({ number }));
    }
    await repository.upsert(newsRecord({ number: 15, type: "kampany" }));

    const first = await app.inject({ method: "GET", url: "/news?type=update" });
    const next = /<a class="more" href="([^"]+)"/.exec(first.body)![1]!;
    const second = await app.inject({
      method: "GET",
      url: next.replace(/&amp;/g, "&"),
    });
    const campaigns = await app.inject({
      method: "GET",
      url: "/news?type=campaign",
    });

    expect(first.statusCode).toBe(200);
    expect((first.body.match(/class="card"/g) ?? []).length).toBe(12);
    expect(first.body).toContain('<link rel="next"');
    expect(first.body).toContain('href="/news?type=update" class="on"');
    expect((second.body.match(/class="card"/g) ?? []).length).toBe(2);
    expect(second.body).not.toContain('class="more"');
    expect((campaigns.body.match(/class="card"/g) ?? []).length).toBe(1);
    expect(campaigns.body).toContain('href="/news/15"');
  });

  it("falls back to Hungarian for the English list", async () => {
    await repository.upsert(newsRecord({ number: 1 }));

    const res = await app.inject({ method: "GET", url: "/news?lang=en" });

    expect(res.body).toContain('<html lang="hu">');
    expect(res.body).toContain('href="/news/1"');
  });

  it("serves a news sitemap", async () => {
    await repository.upsert(newsRecord({ number: 1 }));
    await repository.upsert(newsRecord({ number: 2, lang: "en" }));
    await repository.upsert(newsRecord({ number: 3, visible: false }));

    const res = await app.inject({ method: "GET", url: "/news/sitemap.xml" });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("application/xml; charset=utf-8");
    expect(res.body).toContain("<loc>https://kampanykorut.hu/news</loc>");
    expect(res.body).toContain("<loc>https://kampanykorut.hu/news/1</loc>");
    expect(res.body).toContain("<loc>https://kampanykorut.hu/news/2</loc>");
    expect(res.body).not.toContain("/news/3<");
    expect(res.body).toContain("<lastmod>2026-10-01T00:00:00.000Z</lastmod>");
  });

  it("supports conditional requests", async () => {
    await repository.upsert(newsRecord({ number: 1 }));
    const first = await app.inject({ method: "GET", url: "/news/1" });

    const res = await app.inject({
      method: "GET",
      url: "/news/1",
      headers: { "if-none-match": first.headers.etag as string },
    });

    expect(res.statusCode).toBe(304);
  });
});
