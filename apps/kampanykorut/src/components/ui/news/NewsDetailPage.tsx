import { t } from "i18next";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import type { NewsDetail, NewsLang } from "@/shared/types";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import { isExternalUrl } from "../../../logic/application/news/news.format";
import {
  type NewsDetailState,
  useNewsDetail,
  useNewsLang,
} from "../../../logic/application/news/useNews";
import { NewsPageLayout } from "./NewsPageLayout";
import { NewsCoverImage, NewsDate, NewsTypeBadge, Skeleton } from "./NewsParts";

export function NewsDetailPage() {
  const number = Number(useParams().number);
  const state = useNewsDetail(number);
  const lang = useNewsLang();

  useEffect(() => {
    if (state.status === "ready") {
      document.title = `${state.news.title} – Kampánykörút`;
    }
  }, [state]);

  return (
    <NewsPageLayout>
      <NewsDetailView state={state} lang={lang} />
    </NewsPageLayout>
  );
}

interface NewsDetailViewProps {
  state: NewsDetailState;
  lang: NewsLang;
}

export function NewsDetailView({ state, lang }: NewsDetailViewProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        to="/hirek"
        className="self-start text-sm font-bold text-blue-400 hover:text-blue-300"
      >
        ← {t("news.detail.back")}
      </Link>
      {state.status === "loading" && <DetailSkeleton />}
      {state.status === "not-found" && (
        <Text as="p" color="gray">
          {t("news.detail.notFound")}
        </Text>
      )}
      {state.status === "error" && (
        <Text as="p" color="gray">
          {t("news.detail.error")}
        </Text>
      )}
      {state.status === "ready" && (
        <NewsArticle news={state.news} lang={lang} />
      )}
    </div>
  );
}

export function NewsArticle({
  news,
  lang,
}: {
  news: NewsDetail;
  lang: NewsLang;
}) {
  const ctaExternal = news.cta ? isExternalUrl(news.cta.url) : false;

  return (
    <article className="flex flex-col gap-5">
      {news.cover && (
        <NewsCoverImage
          cover={news.cover}
          variant="large"
          className="aspect-video w-full rounded-lg"
        />
      )}
      <div className="flex items-center gap-3">
        <NewsTypeBadge type={news.type} />
        <NewsDate iso={news.publishedAt} lang={lang} />
      </div>
      <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl">
        {news.title}
      </h1>
      <div
        className="news-content flex flex-col gap-4 text-base leading-relaxed text-slate-300"
        dangerouslySetInnerHTML={{ __html: news.html }}
      />
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        {news.cta ? (
          <a
            href={news.cta.url}
            target={ctaExternal ? "_blank" : undefined}
            rel={ctaExternal ? "noopener noreferrer" : undefined}
            className="inline-flex h-10 items-center rounded-md bg-btn-primary px-4 text-sm font-bold text-slate-50 shadow-btn-primary transition hover:bg-btn-primary-hover hover:shadow-btn-primary-hover"
          >
            {news.cta.label}
          </a>
        ) : (
          <span />
        )}
        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-300"
        >
          <Icon
            name="github"
            size={14}
            color="currentColor"
            className="mr-1.5"
          />
          {t("news.detail.comment")}
        </a>
      </div>
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-5">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}
