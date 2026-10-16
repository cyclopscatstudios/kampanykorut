import type {
  NewsArchiveResponse,
  NewsDetail,
  NewsLang,
  NewsListResponse,
  NewsType,
} from "@/shared/types";

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export class NewsNotFoundError extends Error {
  constructor(number: number) {
    super(`News #${number} not found`);
    this.name = "NewsNotFoundError";
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    signal,
    headers: { accept: "application/json" },
  });

  if (!res.ok) {
    throw Object.assign(
      new Error(`News API ${path} failed with ${res.status}`),
      {
        status: res.status,
      },
    );
  }

  return (await res.json()) as T;
}

function query(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export function fetchLatestNews(
  { limit, lang }: { limit: number; lang: NewsLang },
  signal?: AbortSignal,
) {
  return getJson<NewsListResponse>(
    `/api/v1/news${query({ limit, lang })}`,
    signal,
  );
}

export function fetchNewsArchive(
  {
    lang,
    limit,
    type,
    cursor,
  }: { lang: NewsLang; limit: number; type?: NewsType; cursor?: string },
  signal?: AbortSignal,
) {
  return getJson<NewsArchiveResponse>(
    `/api/v1/news/archive${query({ lang, limit, type, cursor })}`,
    signal,
  );
}

export async function fetchNewsDetail(number: number, signal?: AbortSignal) {
  try {
    return await getJson<NewsDetail>(`/api/v1/news/${number}`, signal);
  } catch (err) {
    if ((err as { status?: number }).status === 404) {
      throw new NewsNotFoundError(number);
    }
    throw err;
  }
}
