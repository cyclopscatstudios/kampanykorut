import type { NewsRecord } from "../news.repository";

export const newsRecord = (overrides: Partial<NewsRecord> = {}): NewsRecord => {
  const number = overrides.number ?? 1;
  return {
    githubId: `D_${number}`,
    number,
    title: `Hír ${number}`,
    type: "frissites",
    lang: "hu",
    lead: "Rövid bevezető.",
    markdown: "Rövid bevezető.",
    html: "<p>Rövid bevezető.</p>",
    coverSourceUrl: null,
    cover: null,
    cta: null,
    url: `https://github.com/cyclopscatstudios/kampanykorut/discussions/${number}`,
    isPinned: false,
    visible: true,
    expiresAt: null,
    publishedAt: new Date(Date.UTC(2026, 9, number)),
    updatedAt: new Date(Date.UTC(2026, 9, number)),
    sourceHash: "hash",
    contentComplete: true,
    syncedAt: new Date("2026-10-15T12:00:00Z"),
    ...overrides,
  };
};
