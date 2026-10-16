export const NEWS_CATEGORY_ID = "DIC_kwDOnews";
export const OTHER_CATEGORY_ID = "DIC_kwDOgeneral";

export const categoriesResponse = {
  repository: {
    discussionCategories: {
      nodes: [
        { id: OTHER_CATEGORY_ID, name: "General", slug: "general" },
        { id: NEWS_CATEGORY_ID, name: "Hírek", slug: "hirek" },
      ],
    },
  },
};

export const discussionNode = (overrides: Record<string, unknown> = {}) => ({
  id: "D_kwDO42",
  number: 42,
  title: "Megérkezett a 2026-os kampány",
  body: [
    "![borító](https://github.com/user-attachments/assets/abc)",
    "",
    "Mostantól a 2026-os választás is végigjátszható.",
    "",
    "[Kipróbálom →](https://kampanykorut.hu/kampany/2026)",
  ].join("\n"),
  url: "https://github.com/cyclopscatstudios/kampanykorut/discussions/42",
  createdAt: "2026-10-10T08:00:00Z",
  updatedAt: "2026-10-11T09:30:00Z",
  closed: false,
  upvoteCount: 7,
  category: { id: NEWS_CATEGORY_ID },
  comments: { totalCount: 3 },
  labels: { nodes: [{ name: "kampany" }, { name: "lang:en" }] },
  ...overrides,
});

export const pinned = (...ids: string[]) => ({
  nodes: ids.map((id) => ({ discussion: { id } })),
});

export const discussionsPage = (
  nodes: unknown[],
  endCursor: string | null = null,
  pinnedIds: string[] = [],
) => ({
  repository: {
    pinnedDiscussions: pinned(...pinnedIds),
    discussions: {
      nodes,
      pageInfo: { hasNextPage: endCursor !== null, endCursor },
    },
  },
});
