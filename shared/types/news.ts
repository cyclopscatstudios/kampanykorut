export const NEWS_TYPES = [
  "uj-funkcio",
  "frissites",
  "kampany",
  "javitas",
] as const;

export type NewsType = (typeof NEWS_TYPES)[number];

export const NEWS_TYPE_SLUGS: Record<NewsType, string> = {
  "uj-funkcio": "feature",
  frissites: "update",
  kampany: "campaign",
  javitas: "fix",
};
export type NewsLang = "hu" | "en";

export interface NewsCover {
  large16x9Url: string;
  thumbUrl: string;
}

export interface NewsCta {
  label: string;
  url: string;
}

export interface NewsItem {
  number: number;
  title: string;
  type: NewsType | null;
  lang: NewsLang;
  lead: string;
  cover: NewsCover | null;
  cta: NewsCta | null;
  url: string;
  isPinned: boolean;
  publishedAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface NewsDetail extends NewsItem {
  html: string;
}

export interface NewsListResponse {
  items: NewsItem[];
}

export interface NewsArchiveResponse {
  items: NewsItem[];
  nextCursor: string | null;
}
