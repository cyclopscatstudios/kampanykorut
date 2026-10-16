import { NEWS_TYPE_SLUGS, NEWS_TYPES, type NewsType } from "@/shared/types";

export const NEWS_PATH = "/news";

export const newsDetailPath = (number: number) => `${NEWS_PATH}/${number}`;

export const NEWS_TYPE_PARAM = "type";

export const newsTypeToSlug = (type: NewsType) => NEWS_TYPE_SLUGS[type];

export const newsTypeFromSlug = (slug: string | null): NewsType | undefined =>
  NEWS_TYPES.find((type) => NEWS_TYPE_SLUGS[type] === slug);
