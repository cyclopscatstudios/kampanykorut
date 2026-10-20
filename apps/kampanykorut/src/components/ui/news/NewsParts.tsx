import classNames from "classnames";
import { t } from "i18next";
import type { NewsCover, NewsLang, NewsType } from "@/shared/types";
import { formatNewsDate } from "../../../logic/application/news/news.format";

const PLACEHOLDER =
  "bg-[repeating-linear-gradient(135deg,rgba(148,163,184,0.10)_0_8px,rgba(148,163,184,0.04)_8px_16px)]";

export function NewsTypeBadge({ type }: { type: NewsType | null }) {
  if (!type) return null;
  return (
    <span className="inline-flex h-[18px] items-center rounded px-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#1a1206] bg-[#e0a23b]">
      {t(`news.types.${type}`)}
    </span>
  );
}

export function NewsKicker({ type }: { type: NewsType | null }) {
  if (!type) return null;
  return (
    <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-400">
      {t(`news.types.${type}`)}
    </span>
  );
}

export function NewsDate({
  iso,
  lang,
  short,
}: {
  iso: string;
  lang: NewsLang;
  short?: boolean;
}) {
  return (
    <time dateTime={iso} className="font-mono text-[11px] text-slate-500">
      {formatNewsDate(iso, lang, { short })}
    </time>
  );
}

export function NewsCoverImage({
  cover,
  variant,
  className,
}: {
  cover: NewsCover | null;
  variant: "large" | "thumb";
  className?: string;
}) {
  if (!cover) {
    return <div aria-hidden className={classNames(PLACEHOLDER, className)} />;
  }

  return (
    <img
      src={variant === "large" ? cover.large16x9Url : cover.thumbUrl}
      alt={t("news.coverAlt")}
      loading="lazy"
      className={classNames("object-cover", className)}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={classNames("animate-pulse rounded bg-slate-400/10", className)}
    />
  );
}
