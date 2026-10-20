import type { NewsDetail, NewsItem } from "@/shared/types";

const cover = (seed: string) => ({
  large16x9Url: `https://picsum.photos/seed/${seed}/1200/675`,
  thumbUrl: `https://picsum.photos/seed/${seed}/320/320`,
});

const item = (overrides: Partial<NewsItem> & { number: number }): NewsItem => ({
  title: "Hír",
  type: null,
  lang: "hu",
  lead: "",
  cover: null,
  cta: null,
  url: `https://github.com/cyclopscatstudios/kampanykorut/discussions/${overrides.number}`,
  isPinned: false,
  publishedAt: "2026-10-12T08:00:00Z",
  updatedAt: "2026-10-12T08:00:00Z",
  expiresAt: null,
  ...overrides,
});

export const sampleNews: NewsItem[] = [
  item({
    number: 12,
    title: "Megérkezett a Mod-készítő: írd meg a saját kampányodat",
    type: "uj-funkcio",
    lead: "Saját kérdéssorok, körzetek és jelöltek — mentsd el, és oszd meg a linkkel bárkivel.",
    cover: cover("modkeszito"),
    cta: { label: "Kipróbálom →", url: "https://kampanykorut.hu/menu" },
    isPinned: true,
  }),
  item({
    number: 11,
    title: "v0.1.0-béta: új közvélemény-kutató nézet",
    type: "frissites",
    cover: cover("kutato"),
    publishedAt: "2026-10-03T08:00:00Z",
  }),
  item({
    number: 10,
    title: "Elérhető a 2026: Tavaszi szél kampány",
    type: "kampany",
    cover: cover("tavaszi"),
    publishedAt: "2026-09-21T08:00:00Z",
  }),
  item({
    number: 9,
    title: "Gyorsabb térkép-betöltés mobilon",
    type: "javitas",
    publishedAt: "2026-09-10T08:00:00Z",
  }),
];

export const sampleNewsDetail: NewsDetail = {
  ...sampleNews[0]!,
  html: [
    "<p>Saját kérdéssorok, körzetek és jelöltek — mentsd el, és oszd meg a linkkel bárkivel.</p>",
    "<h2>Mi újság?</h2>",
    "<ul><li>kérdések és válaszok szerkesztése</li><li>saját jelöltek</li></ul>",
    '<p>Részletek a <a href="https://github.com/cyclopscatstudios/kampanykorut" target="_blank" rel="noopener noreferrer">GitHubon</a>.</p>',
  ].join("\n"),
};
