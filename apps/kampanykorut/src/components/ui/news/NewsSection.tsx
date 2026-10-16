import classNames from "classnames";
import { t } from "i18next";
import { Link } from "react-router-dom";
import type { NewsItem, NewsLang } from "@/shared/types";
import { isExternalUrl } from "../../../logic/application/news/news.format";
import {
  type NewsListState,
  useNews,
  useNewsLang,
} from "../../../logic/application/news/useNews";
import { Heading } from "../Heading";
import {
  NewsCoverImage,
  NewsDate,
  NewsKicker,
  NewsTypeBadge,
  Skeleton,
} from "./NewsParts";

export const LANDING_NEWS_LIMIT = 4;

export function NewsSection() {
  const state = useNews(LANDING_NEWS_LIMIT);
  const lang = useNewsLang();
  return <NewsSectionView state={state} lang={lang} />;
}

interface NewsSectionViewProps {
  state: NewsListState;
  lang: NewsLang;
}

export function NewsSectionView({ state, lang }: NewsSectionViewProps) {
  if (state.status === "error") return null;
  if (state.status === "ready" && state.items.length === 0) return null;

  return (
    <section
      aria-labelledby="news-heading"
      className="mx-auto w-full max-w-5xl px-6 pt-12"
    >
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <Heading id="news-heading" level={2} color="white">
          {t("news.heading")}
        </Heading>
        <Link
          to="/hirek"
          className="shrink-0 text-sm font-bold text-blue-400 hover:text-blue-300"
        >
          {t("news.allNews")} →
        </Link>
      </div>
      {state.status === "loading" ? (
        <NewsSectionSkeleton />
      ) : (
        <NewsGrid items={state.items} lang={lang} />
      )}
    </section>
  );
}

function NewsGrid({ items, lang }: { items: NewsItem[]; lang: NewsLang }) {
  const [featured, ...rest] = items;
  const side = rest.slice(0, LANDING_NEWS_LIMIT - 1);

  return (
    <div
      className={classNames(
        "grid gap-4",
        side.length > 0 && "md:grid-cols-[1.35fr_1fr]",
      )}
    >
      <FeaturedNews news={featured!} lang={lang} />
      {side.length > 0 && (
        <ul className="flex flex-col gap-3">
          {side.map((news) => (
            <li key={news.number}>
              <SideNews news={news} lang={lang} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FeaturedNews({ news, lang }: { news: NewsItem; lang: NewsLang }) {
  const detailUrl = `/hirek/${news.number}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-slate-400/20 bg-[#131f3d]">
      <Link to={detailUrl} tabIndex={-1} aria-hidden>
        <NewsCoverImage
          cover={news.cover}
          variant="large"
          className="aspect-video w-full"
        />
      </Link>
      <div className="flex flex-col gap-2.5 p-5">
        <div className="flex items-center gap-3">
          <NewsTypeBadge type={news.type} />
          <NewsDate iso={news.publishedAt} lang={lang} />
        </div>
        <h3 className="text-xl font-extrabold leading-tight tracking-tight text-white">
          <Link to={detailUrl} className="hover:text-blue-200">
            {news.title}
          </Link>
        </h3>
        {news.lead && (
          <p className="text-sm leading-relaxed text-slate-400">{news.lead}</p>
        )}
        {news.cta ? (
          <NewsCtaLink cta={news.cta} />
        ) : (
          <Link
            to={detailUrl}
            className="self-start text-sm font-bold text-blue-400 hover:text-blue-300"
          >
            {t("news.readMore")} →
          </Link>
        )}
      </div>
    </article>
  );
}

function NewsCtaLink({ cta }: { cta: NonNullable<NewsItem["cta"]> }) {
  const external = isExternalUrl(cta.url);
  return (
    <a
      href={cta.url}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="self-start text-sm font-bold text-blue-400 hover:text-blue-300"
    >
      {cta.label}
    </a>
  );
}

function SideNews({ news, lang }: { news: NewsItem; lang: NewsLang }) {
  return (
    <Link
      to={`/hirek/${news.number}`}
      className="grid grid-cols-[84px_1fr] gap-3 rounded-lg border border-slate-400/20 bg-slate-400/5 p-2.5 transition hover:border-blue-400/50 hover:bg-slate-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      <NewsCoverImage
        cover={news.cover}
        variant="thumb"
        className="h-16 w-[84px] rounded"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <NewsKicker type={news.type} />
        <span className="line-clamp-2 text-sm font-bold leading-snug text-white">
          {news.title}
        </span>
        <NewsDate iso={news.publishedAt} lang={lang} short />
      </div>
    </Link>
  );
}

function NewsSectionSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="grid gap-4 md:grid-cols-[1.35fr_1fr]"
    >
      <div className="overflow-hidden rounded-lg border border-slate-400/20">
        <Skeleton className="aspect-video w-full rounded-none" />
        <div className="flex flex-col gap-3 p-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="grid grid-cols-[84px_1fr] gap-3 rounded-lg border border-slate-400/20 p-2.5"
          >
            <Skeleton className="h-16 w-[84px]" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
