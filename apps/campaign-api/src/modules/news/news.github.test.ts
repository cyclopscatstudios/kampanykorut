import { describe, expect, it, vi } from "vitest";
import {
  type GithubClient,
  GithubError,
} from "../../integrations/github/github-client";
import {
  categoriesResponse,
  discussionNode,
  discussionsPage,
  NEWS_CATEGORY_ID,
  OTHER_CATEGORY_ID,
  pinned,
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
        ...discussionsPage([discussionNode()], null, ["D_kwDO42"]),
      },
    });

    const [news] = await new NewsGithubSource(client, "Hírek").fetchLatest();

    expect(graphql).toHaveBeenLastCalledWith(NEWS_DISCUSSIONS_QUERY, {
      ...repo,
      categoryId: NEWS_CATEGORY_ID,
      first: 20,
      after: null,
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

  it("pages through the whole category", async () => {
    const pages = [
      discussionsPage([discussionNode({ id: "D_1", number: 1 })], "c1"),
      discussionsPage([discussionNode({ id: "D_2", number: 2 })]),
    ];
    const graphql = vi.fn(async (query: string) =>
      query === NEWS_CATEGORIES_QUERY ? categoriesResponse : pages.shift(),
    );
    const client = { repo, graphql } as unknown as GithubClient;

    const all = await new NewsGithubSource(client, "Hírek").fetchAll();

    expect(all.map((d) => d.number)).toEqual([1, 2]);
    expect(graphql).toHaveBeenLastCalledWith(
      NEWS_DISCUSSIONS_QUERY,
      expect.objectContaining({ first: 50, after: "c1" }),
    );
  });

  it("fetches a single discussion and tells whether it is news", async () => {
    const { client, graphql } = fakeClient({
      [NEWS_CATEGORIES_QUERY]: categoriesResponse,
      [NEWS_DISCUSSION_QUERY]: {
        repository: {
          pinnedDiscussions: pinned(),
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
      [NEWS_DISCUSSION_QUERY]: {
        repository: { pinnedDiscussions: pinned(), discussion: null },
      },
    });

    await expect(
      new NewsGithubSource(client, "Hírek").fetchByNumber(404),
    ).resolves.toBeNull();
  });

  it("treats a NOT_FOUND GraphQL error as a deleted discussion", async () => {
    const graphql = vi.fn(async () => {
      throw new GithubError("Could not resolve", undefined, ["NOT_FOUND"]);
    });
    const client = { repo, graphql } as unknown as GithubClient;

    await expect(
      new NewsGithubSource(client, "Hírek").fetchByNumber(1),
    ).resolves.toBeNull();
  });

  it("rejects responses that do not match the expected shape", async () => {
    const { client } = fakeClient({
      [NEWS_CATEGORIES_QUERY]: categoriesResponse,
      [NEWS_DISCUSSIONS_QUERY]: {
        ...discussionsPage([discussionNode({ number: "42" })]),
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
