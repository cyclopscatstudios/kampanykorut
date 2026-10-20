import { useCallback, useEffect, useRef, useState } from "react";
import { createLogger } from "@/shared/logger";
import type { NewsDetail, NewsItem, NewsLang, NewsType } from "@/shared/types";
import { useSettings } from "../hooks/useSettings";
import {
  fetchLatestNews,
  fetchNewsArchive,
  fetchNewsDetail,
  NewsNotFoundError,
} from "./newsApi";

const log = createLogger("useNews");

export type NewsListState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: NewsItem[] };

export type NewsDetailState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not-found" }
  | { status: "ready"; news: NewsDetail };

export interface NewsArchiveState {
  status: "loading" | "error" | "ready";
  items: NewsItem[];
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
}

const isAbort = (err: unknown) =>
  err instanceof DOMException && err.name === "AbortError";

export function useNewsLang(): NewsLang {
  return useSettings().settings.language;
}

function useKeyedRequest<T>(
  key: string,
  run: (signal: AbortSignal) => Promise<T>,
  onError: (err: unknown) => T,
): T | undefined {
  const [result, setResult] = useState<{ key: string; value: T } | null>(null);
  const callbacks = useRef({ run, onError });

  useEffect(() => {
    callbacks.current = { run, onError };
  });

  useEffect(() => {
    const controller = new AbortController();

    callbacks.current
      .run(controller.signal)
      .then((value) => setResult({ key, value }))
      .catch((err: unknown) => {
        if (!isAbort(err)) {
          setResult({ key, value: callbacks.current.onError(err) });
        }
      });

    return () => controller.abort();
  }, [key]);

  return result?.key === key ? result.value : undefined;
}

export function useNews(limit: number): NewsListState {
  const lang = useNewsLang();
  const state = useKeyedRequest<NewsListState>(
    `${lang}|${limit}`,
    async (signal) => {
      const { items } = await fetchLatestNews({ limit, lang }, signal);
      return { status: "ready", items };
    },
    (err) => {
      log.warn("News are not available", err);
      return { status: "error" };
    },
  );

  return state ?? { status: "loading" };
}

export function useNewsDetail(number: number): NewsDetailState {
  const state = useKeyedRequest<NewsDetailState>(
    String(number),
    async (signal) => ({
      status: "ready",
      news: await fetchNewsDetail(number, signal),
    }),
    (err) => {
      if (err instanceof NewsNotFoundError) return { status: "not-found" };
      log.warn("News detail is not available", err);
      return { status: "error" };
    },
  );

  return state ?? { status: "loading" };
}

interface ArchivePages {
  status: "ready" | "error";
  items: NewsItem[];
  cursor: string | null;
}

export function useNewsArchive(
  type: NewsType | undefined,
  pageSize = 12,
): NewsArchiveState {
  const lang = useNewsLang();
  const key = `${lang}|${type ?? ""}|${pageSize}`;
  const firstPage = useKeyedRequest<ArchivePages>(
    key,
    async (signal) => {
      const page = await fetchNewsArchive(
        { lang, limit: pageSize, type },
        signal,
      );
      return { status: "ready", items: page.items, cursor: page.nextCursor };
    },
    (err) => {
      log.warn("News archive is not available", err);
      return { status: "error", items: [], cursor: null };
    },
  );
  const [more, setMore] = useState<{ key: string; pages: ArchivePages } | null>(
    null,
  );
  const [loadingMore, setLoadingMore] = useState(false);

  const pages = more?.key === key ? more.pages : firstPage;

  const loadMore = useCallback(() => {
    if (!pages?.cursor || loadingMore) return;
    setLoadingMore(true);

    fetchNewsArchive({ lang, limit: pageSize, type, cursor: pages.cursor })
      .then((page) =>
        setMore({
          key,
          pages: {
            status: "ready",
            items: [...pages.items, ...page.items],
            cursor: page.nextCursor,
          },
        }),
      )
      .catch((err: unknown) => log.warn("Could not load more news", err))
      .finally(() => setLoadingMore(false));
  }, [pages, loadingMore, lang, pageSize, type, key]);

  return {
    status: pages?.status ?? "loading",
    items: pages?.items ?? [],
    hasMore: Boolean(pages?.cursor),
    loadingMore,
    loadMore,
  };
}
