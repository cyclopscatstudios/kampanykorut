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
  it("connects, reports readiness and backs the news and play time APIs", async () => {
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
      const playTime = await app.inject({
        method: "POST",
        url: "/api/v1/play-time/0b6f3c1e-7d2a-4a8e-9c4b-2f1d5e6a7b8c/events",
        payload: { type: "start", campaignId: "2026" },
      });

      expect(ready.json()).toEqual({
        status: "ready",
        checks: { mongo: "ok" },
      });
      expect(news.json()).toEqual({ items: [] });
      expect(playTime.statusCode).toBe(204);
      expect(await app.mongo.collection("playTimes").countDocuments()).toBe(1);
    } finally {
      await app.close();
    }
  });
});
