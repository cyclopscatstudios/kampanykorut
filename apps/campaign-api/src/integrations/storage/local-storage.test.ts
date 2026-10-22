import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type App, buildApp } from "../../app";
import { loadConfig } from "../../config/env";
import { InMemoryBugReportRepository } from "../../modules/bug-reports/bug-reports.repository";
import { renderNewsHtml } from "../../modules/news/news.render";
import { InMemoryNewsRepository } from "../../modules/news/news.repository";
import { LocalObjectStorage } from "./local-storage";

describe("LocalObjectStorage", () => {
  let dir: string;
  let storage: LocalObjectStorage;
  let app: App;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "assets-"));
    storage = new LocalObjectStorage(dir);
    app = await buildApp(
      loadConfig({ NODE_ENV: "test", LOG_LEVEL: "silent" }),
      { objectStorage: storage },
    );
  });

  afterEach(async () => {
    await app.close();
    await rm(dir, { recursive: true, force: true });
  });

  it("stores files and serves them under the API", async () => {
    const key = "news/abc123/cover-16x9.webp";
    await storage.put(key, Buffer.from("webp-bytes"));

    const res = await app.inject({
      method: "GET",
      url: storage.publicUrl(key),
    });

    expect(storage.publicUrl(key)).toBe(`/api/v1/assets/${key}`);
    await expect(storage.exists(key)).resolves.toBe(true);
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("image/webp");
    expect(res.body).toBe("webp-bytes");
  });

  it("rejects unknown and unsafe keys", async () => {
    const missing = await app.inject({
      method: "GET",
      url: "/api/v1/assets/news/nope/thumb.webp",
    });
    const traversal = await app.inject({
      method: "GET",
      url: "/api/v1/assets/..%2F..%2Fpackage.json",
    });

    expect(missing.statusCode).toBe(404);
    expect(traversal.statusCode).toBe(404);
    expect(() => storage.filePath("../secret.webp")).toThrow(/Invalid/);
  });

  it("keeps relative asset URLs in rendered news HTML", () => {
    expect(
      renderNewsHtml("![kép](https://example.com/a.png)", () =>
        storage.publicUrl("news/a/inline.webp"),
      ),
    ).toContain('src="/api/v1/assets/news/a/inline.webp"');
  });
});

describe("ASSETS_DIR", () => {
  it("enables local image storage outside development", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "assets-"));
    const app = await buildApp(
      loadConfig({
        NODE_ENV: "production",
        LOG_LEVEL: "silent",
        MONGODB_URI: "mongodb://unused:27017/test",
        ASSETS_DIR: dir,
      }),
      {
        newsRepository: new InMemoryNewsRepository(),
        bugReportRepository: new InMemoryBugReportRepository(),
      },
    );

    try {
      const ready = await app.inject({ method: "GET", url: "/ready" });
      const missing = await app.inject({
        method: "GET",
        url: "/api/v1/assets/news/x/thumb.webp",
      });

      expect(ready.json()).toMatchObject({ checks: { storage: "ok" } });
      expect(missing.statusCode).toBe(404);
      expect(missing.headers["content-type"]).toContain("problem+json");
    } finally {
      await app.close();
      await rm(dir, { recursive: true, force: true });
    }
  });
});
