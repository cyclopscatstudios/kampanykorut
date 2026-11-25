import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type App, buildApp } from "../../app";
import { loadConfig } from "../../config/env";
import { InMemoryBugReportRepository } from "../bug-reports/bug-reports.repository";
import { InMemoryNewsRepository } from "../news/news.repository";
import { InMemoryPlayTimeRepository } from "./play-time.repository";
import { PLAY_TIME_PATH } from "./play-time.routes";

const SESSION_ID = "0b6f3c1e-7d2a-4a8e-9c4b-2f1d5e6a7b8c";
const START = new Date("2026-11-20T10:00:00Z");

describe("play time API", () => {
  let app: App;
  let repository: InMemoryPlayTimeRepository;
  let now: Date;

  beforeEach(async () => {
    repository = new InMemoryPlayTimeRepository();
    now = START;
    app = await buildApp(
      loadConfig({ NODE_ENV: "test", LOG_LEVEL: "silent" }),
      {
        newsRepository: new InMemoryNewsRepository(),
        bugReportRepository: new InMemoryBugReportRepository(),
        playTimeRepository: repository,
        playTimeRateLimit: { max: 3, timeWindow: "1 minute" },
        now: () => now,
      },
    );
  });

  afterEach(async () => {
    await app.close();
  });

  const send = (
    type: string,
    sessionId = SESSION_ID,
    campaignId: unknown = "2026",
  ) =>
    app.inject({
      method: "POST",
      url: `${PLAY_TIME_PATH}/${sessionId}/events`,
      payload: { type, campaignId },
    });

  it("measures the time with the server clock", async () => {
    expect((await send("start")).statusCode).toBe(204);
    now = new Date(START.getTime() + 42_000);
    expect((await send("finish")).statusCode).toBe(204);

    expect(await repository.findBySessionId(SESSION_ID)).toMatchObject({
      campaignId: "2026",
      status: "finished",
      activeMs: 42_000,
      finishedAt: now,
    });
  });

  it("rejects malformed events", async () => {
    expect((await send("rewind")).statusCode).toBe(400);
    expect((await send("start", "x")).statusCode).toBe(400);
    expect((await send("start", SESSION_ID, "")).statusCode).toBe(400);
    expect(await repository.findBySessionId(SESSION_ID)).toBeNull();
  });

  it("rate limits the endpoint", async () => {
    for (let i = 0; i < 3; i++) await send("heartbeat");
    expect((await send("heartbeat")).statusCode).toBe(429);
  });
});
