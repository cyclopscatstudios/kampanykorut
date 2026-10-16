import classNames from "classnames";
import { t } from "i18next";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { NewsItem, NewsLang } from "@/shared/types";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Tooltip } from "../../../../../../shared/ui/Tooltip";
import { NEWS_PATH } from "../../../logic/application/news/newsPaths";
import {
  useNewsDetail,
  useNewsLang,
} from "../../../logic/application/news/useNews";
import { useNewsNotifications } from "../../../logic/application/news/useNewsNotifications";
import { Dialog } from "../Dialog";
import { NewsArticle } from "./NewsDetailPage";
import { NewsCoverImage, NewsDate, Skeleton } from "./NewsParts";

export function NewsBell() {
  const { status, items, unread, markRead, markAllRead } =
    useNewsNotifications();
  const lang = useNewsLang();
  const [selected, setSelected] = useState<number | null>(null);

  if (status !== "ready" || items.length === 0) return null;

  return (
    <>
      <NewsBellView
        items={items}
        unread={unread}
        lang={lang}
        onOpenItem={(number) => {
          markRead(number);
          setSelected(number);
        }}
        onMarkAllRead={markAllRead}
      />
      {selected !== null && (
        <NewsDetailDialog
          number={selected}
          lang={lang}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

interface NewsBellViewProps {
  items: NewsItem[];
  unread: Set<number>;
  lang: NewsLang;
  onOpenItem: (number: number) => void;
  onMarkAllRead: () => void;
  defaultOpen?: boolean;
}

export function NewsBellView({
  items,
  unread,
  lang,
  onOpenItem,
  onMarkAllRead,
  defaultOpen = false,
}: NewsBellViewProps) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const unreadCount = unread.size;
  const label =
    unreadCount > 0
      ? t("news.bell.unread", { count: unreadCount })
      : t("news.heading");

  const bellButton = (
    <Button
      variant="underline"
      onClick={() => setOpen((current) => !current)}
      testId="news-bell"
    >
      <span className="relative inline-flex" aria-label={label}>
        <Icon name="bell-fill" color="lightBlue" />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e0a23b] px-1 text-[9px] font-extrabold text-[#1a1206]">
            {unreadCount}
          </span>
        )}
      </span>
    </Button>
  );

  return (
    <div ref={ref} className="relative">
      {open ? (
        bellButton
      ) : (
        <Tooltip content={label} position="bottom">
          {bellButton}
        </Tooltip>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={t("news.heading")}
          className="absolute right-0 top-full z-50 mt-2 w-[300px] overflow-hidden rounded-lg border border-blue-400/35 bg-[#121d3a] text-left shadow-[0_18px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-400">
              {t("news.heading")}
            </span>
            <button
              type="button"
              disabled={unreadCount === 0}
              onClick={onMarkAllRead}
              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 disabled:cursor-default disabled:text-slate-500"
            >
              {t("news.bell.markAllRead")}
            </button>
          </div>
          <ul>
            {items.map((news) => {
              const isUnread = unread.has(news.number);
              return (
                <li key={news.number} className="border-t border-slate-400/20">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onOpenItem(news.number);
                    }}
                    className={classNames(
                      "grid w-full grid-cols-[56px_1fr] gap-2.5 px-3 py-2.5 text-left transition hover:bg-slate-400/10",
                      isUnread && "bg-blue-500/10",
                    )}
                  >
                    <NewsCoverImage
                      cover={news.cover}
                      variant="thumb"
                      className="h-[42px] w-14 rounded"
                    />
                    <span className="flex min-w-0 flex-col gap-1">
                      <span
                        className={classNames(
                          "line-clamp-2 text-xs font-bold leading-snug",
                          isUnread ? "text-white" : "text-slate-400",
                        )}
                      >
                        {isUnread && (
                          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#e0a23b] align-middle" />
                        )}
                        {news.title}
                      </span>
                      <NewsDate iso={news.publishedAt} lang={lang} short />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Link
            to={NEWS_PATH}
            className="block border-t border-slate-400/20 px-3 py-2.5 text-center text-xs font-bold text-blue-400 hover:bg-slate-400/10 hover:text-blue-300"
          >
            {t("news.allNews")} →
          </Link>
        </div>
      )}
    </div>
  );
}

interface NewsDetailDialogProps {
  number: number;
  lang: NewsLang;
  onClose: () => void;
}

export function NewsDetailDialog({
  number,
  lang,
  onClose,
}: NewsDetailDialogProps) {
  const state = useNewsDetail(number);

  return (
    <Dialog
      open
      onClose={onClose}
      panelClassName="relative w-full sm:max-w-2xl"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("news.bell.close")}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-slate-300 hover:text-white"
      >
        <Icon name="x-lg" size={14} color="currentColor" />
      </button>
      <div className="p-5">
        {state.status === "loading" && (
          <div role="status" aria-busy="true" className="flex flex-col gap-4">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}
        {state.status === "ready" && (
          <NewsArticle news={state.news} lang={lang} />
        )}
        {(state.status === "error" || state.status === "not-found") && (
          <p className="pr-8 text-sm text-slate-400">
            {t(
              state.status === "error"
                ? "news.detail.error"
                : "news.detail.notFound",
            )}
          </p>
        )}
      </div>
    </Dialog>
  );
}
