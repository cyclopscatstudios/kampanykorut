import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { loadConfig } from "../config/env";

let server: MongoMemoryServer;

beforeAll(async () => {
  server = await MongoMemoryServer.create();
}, 120_000);

afterAll(async () => {
  await server?.stop();
});

describe("mongo plugin", () => {
  it("connects, reports readiness and backs the news API", async () => {
    const app = await buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        MONGODB_URI: `${server.getUri()}kampanykorut`,
      }),
    );

    try {
      const ready = await app.inject({ method: "GET", url: "/ready" });
      const news = await app.inject({ method: "GET", url: "/api/v1/news" });

      expect(ready.json()).toEqual({
        status: "ready",
        checks: { mongo: "ok" },
      });
      expect(news.json()).toEqual({ items: [] });
    } finally {
      await app.close();
    }
  });
});
