import { useEffect, useMemo, useState } from "react";
import { container } from "tsyringe";
import type { NewsItem } from "@/shared/types";
import { NewsReadState } from "./NewsReadState";
import { useNews } from "./useNews";

export const NEWS_NOTIFICATION_LIMIT = 5;

export interface NewsNotifications {
  status: "loading" | "error" | "ready";
  items: NewsItem[];
  unread: Set<number>;
  markRead: (number: number) => void;
  markAllRead: () => void;
}

export function useNewsNotifications(): NewsNotifications {
  const readState = container.resolve(NewsReadState);
  const news = useNews(NEWS_NOTIFICATION_LIMIT);
  const [snapshot, setSnapshot] = useState(() => readState.get());

  useEffect(() => readState.subscribe(setSnapshot), [readState]);

  const items = useMemo(
    () =>
      news.status === "ready"
        ? [...news.items].sort((a, b) =>
            b.publishedAt.localeCompare(a.publishedAt),
          )
        : [],
    [news],
  );

  const unread = useMemo(
    () =>
      new Set(
        items
          .filter((item) => readState.isUnread(item, snapshot))
          .map((item) => item.number),
      ),
    [items, snapshot, readState],
  );

  return {
    status: news.status,
    items,
    unread,
    markRead: (number) => readState.markRead(number),
    markAllRead: () => readState.markAllRead(),
  };
}
