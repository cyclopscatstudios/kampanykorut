import { describe, expect, it, vi } from "vitest";
import type { GithubClient } from "../../integrations/github/github-client";
import {
  categoriesResponse,
  discussionNode,
  NEWS_CATEGORY_ID,
  OTHER_CATEGORY_ID,
} from "./__fixtures__/discussions";
import {
  NEWS_CATEGORIES_QUERY,
  NEWS_DISCUSSION_QUERY,
  NEWS_DISCUSSIONS_QUERY,
  NewsGithubSource,
} from "./news.github";

const repo = { owner: "cyclopscatstudios", name: "kampanykorut" };

function fakeClient(responses: Record<string, unknown>) {
  const graphql = vi.fn(async (query: string) => {
    if (!(query in responses)) throw new Error("unexpected query");
    return responses[query];
  });
  return { client: { repo, graphql } as unknown as GithubClient, graphql };
}

describe("NewsGithubSource", () => {
  it("resolves the news category by name or slug, once", async () => {
    const { client, graphql } = fakeClient({
      [NEWS_CATEGORIES_QUERY]: categoriesResponse,
    });

    await expect(
      new NewsGithubSource(client, "hirek").resolveCategoryId(),
    ).resolves.toBe(NEWS_CATEGORY_ID);

    const source = new NewsGithubSource(client, "HÍREK");
    await source.resolveCategoryId();
    await source.resolveCategoryId();

    expect(graphql).toHaveBeenCalledTimes(2);
  });

  it("fails clearly when the category does not exist", async () => {
    const { client } = fakeClient({
      [NEWS_CATEGORIES_QUERY]: categoriesResponse,
    });

    await expect(
      new NewsGithubSource(client, "Announcements").resolveCategoryId(),
    ).rejects.toThrow(/"Announcements" not found/);
  });

  it("fetches the newest discussions of the category", async () => {
    const { client, graphql } = fakeClient({
      [NEWS_CATEGORIES_QUERY]: categoriesResponse,
      [NEWS_DISCUSSIONS_QUERY]: {
        repository: { discussions: { nodes: [discussionNode()] } },
      },
    });

    const [news] = await new NewsGithubSource(client, "Hírek").fetchLatest();

    expect(graphql).toHaveBeenLastCalledWith(NEWS_DISCUSSIONS_QUERY, {
      ...repo,
      categoryId: NEWS_CATEGORY_ID,
      first: 20,
    });
    expect(news).toEqual({
      githubId: "D_kwDO42",
      number: 42,
      title: "Megérkezett a 2026-os kampány",
      markdown: expect.stringContaining("Mostantól"),
      url: "https://github.com/cyclopscatstudios/kampanykorut/discussions/42",
      createdAt: new Date("2026-10-10T08:00:00Z"),
      updatedAt: new Date("2026-10-11T09:30:00Z"),
      closed: false,
      isPinned: true,
      upvoteCount: 7,
      commentCount: 3,
      categoryId: NEWS_CATEGORY_ID,
      labels: ["kampany", "lang:en"],
    });
  });

  it("fetches a single discussion and tells whether it is news", async () => {
    const { client, graphql } = fakeClient({
      [NEWS_CATEGORIES_QUERY]: categoriesResponse,
      [NEWS_DISCUSSION_QUERY]: {
        repository: {
          discussion: discussionNode({
            category: { id: OTHER_CATEGORY_ID },
            labels: null,
          }),
        },
      },
    });
    const source = new NewsGithubSource(client, "Hírek");

    const moved = await source.fetchByNumber(42);

    expect(graphql).toHaveBeenCalledWith(NEWS_DISCUSSION_QUERY, {
      ...repo,
      number: 42,
    });
    expect(moved?.labels).toEqual([]);
    await expect(source.isNews(moved!)).resolves.toBe(false);
  });

  it("returns null for a deleted discussion", async () => {
    const { client } = fakeClient({
      [NEWS_DISCUSSION_QUERY]: { repository: { discussion: null } },
    });

    await expect(
      new NewsGithubSource(client, "Hírek").fetchByNumber(404),
    ).resolves.toBeNull();
  });

  it("rejects responses that do not match the expected shape", async () => {
    const { client } = fakeClient({
      [NEWS_CATEGORIES_QUERY]: categoriesResponse,
      [NEWS_DISCUSSIONS_QUERY]: {
        repository: {
          discussions: { nodes: [discussionNode({ number: "42" })] },
        },
      },
    });

    await expect(
      new NewsGithubSource(client, "Hírek").fetchLatest(),
    ).rejects.toThrow(/Unexpected GitHub response shape/);
  });

  it("reports an inaccessible repository", async () => {
    const { client } = fakeClient({
      [NEWS_CATEGORIES_QUERY]: { repository: null },
    });

    await expect(
      new NewsGithubSource(client, "Hírek").resolveCategoryId(),
    ).rejects.toThrow(/not accessible to the GitHub App/);
  });
});
