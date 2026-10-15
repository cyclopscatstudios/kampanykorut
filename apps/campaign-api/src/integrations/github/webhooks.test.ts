import { afterEach, describe, expect, it, vi } from "vitest";
import { type App, buildApp } from "../../app";
import { loadConfig } from "../../config/env";
import {
  discussionNode,
  NEWS_CATEGORY_ID,
} from "../../modules/news/__fixtures__/discussions";
import type { NewsDiscussion } from "../../modules/news/news.github";
import { InMemoryNewsRepository } from "../../modules/news/news.repository";
import type { NewsSource } from "../../modules/news/news.sync";
import { GITHUB_WEBHOOK_PATH, signGithubPayload } from "./webhooks";

const SECRET = "test-webhook-secret-123";

const config = loadConfig({
  NODE_ENV: "test",
  LOG_LEVEL: "silent",
  GITHUB_APP_ID: "1",
  GITHUB_APP_PRIVATE_KEY: "unused",
  GITHUB_APP_INSTALLATION_ID: "2",
  GITHUB_REPO: "cyclopscatstudios/kampanykorut",
  GITHUB_WEBHOOK_SECRET: SECRET,
});

const news: NewsDiscussion = {
  githubId: "D_kwDO42",
  number: 42,
  title: "Megérkezett a 2026-os kampány",
  markdown: "Bevezető.",
  url: discussionNode().url,
  createdAt: new Date("2026-10-10T08:00:00Z"),
  updatedAt: new Date("2026-10-10T08:00:00Z"),
  closed: false,
  isPinned: false,
  upvoteCount: 0,
  commentCount: 0,
  categoryId: NEWS_CATEGORY_ID,
  labels: [],
};

const payload = (repo = "cyclopscatstudios/kampanykorut") => ({
  action: "created",
  discussion: {
    node_id: news.githubId,
    number: news.number,
    category: { node_id: NEWS_CATEGORY_ID },
  },
  repository: { full_name: repo },
});

describe("GitHub webhooks", () => {
  let app: App;
  const repository = new InMemoryNewsRepository();
  const source: NewsSource = {
    resolveCategoryId: vi.fn(async () => NEWS_CATEGORY_ID),
    fetchLatest: vi.fn(async () => []),
    fetchAll: vi.fn(async () => []),
    fetchByNumber: vi.fn(async () => news),
    isNews: vi.fn(async () => true),
  };

  const deliver = (
    body: unknown,
    {
      event = "discussion",
      signature,
    }: { event?: string; signature?: string } = {},
  ) => {
    const raw = JSON.stringify(body);
    return app.inject({
      method: "POST",
      url: GITHUB_WEBHOOK_PATH,
      headers: {
        "content-type": "application/json",
        "x-github-event": event,
        "x-github-delivery": "delivery-1",
        "x-hub-signature-256": signature ?? signGithubPayload(SECRET, raw),
      },
      payload: raw,
    });
  };

  afterEach(async () => {
    await app?.close();
    vi.clearAllMocks();
  });

  it("syncs news from a signed discussion event", async () => {
    app = await buildApp(config, {
      newsSource: source,
      newsRepository: repository,
    });

    const res = await deliver(payload());

    expect(res.statusCode).toBe(204);
    expect(source.fetchByNumber).toHaveBeenCalledWith(42);
    await expect(repository.findByGithubId("D_kwDO42")).resolves.toMatchObject({
      title: "Megérkezett a 2026-os kampány",
      visible: true,
    });
  });

  it("rejects an invalid signature", async () => {
    app = await buildApp(config, {
      newsSource: source,
      newsRepository: repository,
    });

    const res = await deliver(payload(), {
      signature: signGithubPayload("wrong-secret", "{}"),
    });

    expect(res.statusCode).toBe(401);
    expect(source.fetchByNumber).not.toHaveBeenCalled();
  });

  it("acknowledges events nobody handles", async () => {
    app = await buildApp(config, {
      newsSource: source,
      newsRepository: repository,
    });

    const res = await deliver(
      { zen: "Keep it logically awesome." },
      { event: "ping" },
    );

    expect(res.statusCode).toBe(202);
  });

  it("ignores events from other repositories", async () => {
    app = await buildApp(config, {
      newsSource: source,
      newsRepository: repository,
    });

    const res = await deliver(payload("someone/else"));

    expect(res.statusCode).toBe(204);
    expect(source.fetchByNumber).not.toHaveBeenCalled();
  });

  it("is not exposed without a webhook secret", async () => {
    app = await buildApp(
      { ...config, github: { ...config.github!, webhookSecret: null } },
      { newsSource: source, newsRepository: repository },
    );

    const res = await deliver(payload());

    expect(res.statusCode).toBe(404);
  });

  it("keeps regular JSON parsing for other routes", async () => {
    app = await buildApp(config, {
      newsSource: source,
      newsRepository: repository,
    });
    app.post("/echo", async (request) => request.body);

    const res = await app.inject({
      method: "POST",
      url: "/echo",
      payload: { ok: true },
    });

    expect(res.json()).toEqual({ ok: true });
  });
});
