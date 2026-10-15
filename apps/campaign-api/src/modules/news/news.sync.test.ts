import type { FastifyBaseLogger } from "fastify";
import { describe, expect, it, vi } from "vitest";
import { discussionNode, NEWS_CATEGORY_ID } from "./__fixtures__/discussions";
import type { NewsDiscussion } from "./news.github";
import { InMemoryNewsRepository } from "./news.repository";
import { type NewsSource, NewsSync } from "./news.sync";

const NOW = new Date("2026-10-15T12:00:00Z");
const silentLog = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
} as unknown as FastifyBaseLogger;

const discussion = (
  overrides: Partial<NewsDiscussion> = {},
): NewsDiscussion => ({
  githubId: "D_1",
  number: 1,
  title: "Hír",
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
  ...overrides,
});

function setup(source: Partial<NewsSource> = {}) {
  const fullSource: NewsSource = {
    resolveCategoryId: vi.fn(async () => NEWS_CATEGORY_ID),
    fetchLatest: vi.fn(async () => []),
    fetchAll: vi.fn(async () => []),
    fetchByNumber: vi.fn(async () => null),
    isNews: vi.fn(
      async (d: NewsDiscussion) => d.categoryId === NEWS_CATEGORY_ID,
    ),
    ...source,
  };
  const repository = new InMemoryNewsRepository();
  const sync = new NewsSync(fullSource, repository, silentLog, () => NOW);
  return { sync, repository, source: fullSource };
}

const event = (
  action: string,
  d: NewsDiscussion,
  categoryId = d.categoryId,
) => ({
  action,
  discussion: {
    node_id: d.githubId,
    number: d.number,
    category: { node_id: categoryId },
  },
});

describe("NewsSync", () => {
  it("stores the latest discussions", async () => {
    const { sync, repository } = setup({
      fetchLatest: vi.fn(async () => [discussion({ labels: ["javitas"] })]),
    });

    await expect(sync.syncLatest()).resolves.toEqual({ updated: 1, hidden: 0 });
    await expect(repository.findByGithubId("D_1")).resolves.toMatchObject({
      type: "javitas",
      visible: true,
      syncedAt: NOW,
    });
  });

  it("hides stored news missing from a full sync", async () => {
    const { sync, repository } = setup({
      fetchLatest: vi.fn(async () => [
        discussion(),
        discussion({ githubId: "D_2", number: 2 }),
      ]),
      fetchAll: vi.fn(async () => [discussion()]),
    });
    await sync.syncLatest();

    await expect(sync.syncAll()).resolves.toEqual({ updated: 1, hidden: 1 });
    await expect(repository.listVisibleGithubIds()).resolves.toEqual(["D_1"]);
  });

  it("runs only one sync at a time", async () => {
    const { sync, source } = setup();

    await Promise.all([sync.syncAll(), sync.syncLatest()]);

    expect(source.fetchAll).toHaveBeenCalledTimes(1);
    expect(source.fetchLatest).not.toHaveBeenCalled();
  });

  it("syncs a news discussion reported by a webhook", async () => {
    const d = discussion({ title: "Friss hír" });
    const { sync, repository } = setup({ fetchByNumber: vi.fn(async () => d) });

    await sync.handleDiscussionEvent(event("created", d));

    await expect(repository.findByGithubId("D_1")).resolves.toMatchObject({
      title: "Friss hír",
      visible: true,
    });
  });

  it("ignores webhooks about unrelated discussions", async () => {
    const d = discussion({ categoryId: "DIC_other" });
    const { sync, source } = setup();

    await sync.handleDiscussionEvent(event("created", d));

    expect(source.fetchByNumber).not.toHaveBeenCalled();
  });

  it("hides news moved to another category", async () => {
    const moved = discussion({ categoryId: "DIC_other" });
    const { sync, repository } = setup({
      fetchLatest: vi.fn(async () => [discussion()]),
      fetchByNumber: vi.fn(async () => moved),
    });
    await sync.syncLatest();

    await sync.handleDiscussionEvent(event("category_changed", moved));

    await expect(repository.findByGithubId("D_1")).resolves.toMatchObject({
      visible: false,
    });
  });

  it("hides deleted news without asking GitHub", async () => {
    const d = discussion();
    const { sync, repository, source } = setup({
      fetchLatest: vi.fn(async () => [d]),
    });
    await sync.syncLatest();

    await sync.handleDiscussionEvent(event("deleted", d));

    expect(source.fetchByNumber).not.toHaveBeenCalled();
    await expect(repository.listVisibleGithubIds()).resolves.toEqual([]);
  });
});
