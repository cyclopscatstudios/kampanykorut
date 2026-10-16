import { t } from "i18next";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { NEWS_TYPES, type NewsLang, type NewsType } from "@/shared/types";
import { Button } from "../../../../../../shared/ui/Button";
import { Text } from "../../../../../../shared/ui/Text";
import {
  NEWS_TYPE_PARAM,
  newsDetailPath,
  newsTypeFromSlug,
  newsTypeToSlug,
} from "../../../logic/application/news/newsPaths";
import {
  type NewsArchiveState,
  useNewsArchive,
  useNewsLang,
} from "../../../logic/application/news/useNews";
import { Heading } from "../Heading";
import { NewsPageLayout } from "./NewsPageLayout";
import { NewsCoverImage, NewsDate, NewsTypeBadge, Skeleton } from "./NewsParts";

export function NewsArchivePage() {
  const [params, setParams] = useSearchParams();
  const type = newsTypeFromSlug(params.get(NEWS_TYPE_PARAM));
  const lang = useNewsLang();
  const archive = useNewsArchive(type);

  useEffect(() => {
    document.title = `${t("news.archive.title")} – Kampánykörút`;
  }, [lang]);

  const selectType = (next: NewsType | undefined) =>
    setParams(next ? { [NEWS_TYPE_PARAM]: newsTypeToSlug(next) } : {}, {
      replace: true,
    });

  return (
    <NewsPageLayout>
      <NewsArchiveView
        archive={archive}
        lang={lang}
        type={type}
        onSelectType={selectType}
      />
    </NewsPageLayout>
  );
}

interface NewsArchiveViewProps {
  archive: NewsArchiveState;
  lang: NewsLang;
  type: NewsType | undefined;
  onSelectType: (type: NewsType | undefined) => void;
}

export function NewsArchiveView({
  archive,
  lang,
  type,
  onSelectType,
}: NewsArchiveViewProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Heading level={1} color="white">
          {t("news.archive.title")}
        </Heading>
        <Text as="p" color="gray">
          {t("news.archive.description")}
        </Text>
      </div>

      <div role="group" className="flex flex-wrap gap-2">
        <Button
          variant="tab"
          size="sm"
          selected={!type}
          onClick={() => onSelectType(undefined)}
        >
          {t("news.archive.all")}
        </Button>
        {NEWS_TYPES.map((option) => (
          <Button
            key={option}
            variant="tab"
            size="sm"
            selected={type === option}
            onClick={() => onSelectType(option)}
          >
            {t(`news.types.${option}`)}
          </Button>
        ))}
      </div>

      {archive.status === "loading" && <ArchiveSkeleton />}
      {archive.status === "error" && (
        <Text as="p" color="gray">
          {t("news.archive.error")}
        </Text>
      )}
      {archive.status === "ready" && archive.items.length === 0 && (
        <Text as="p" color="gray">
          {t("news.archive.empty")}
        </Text>
      )}
      {archive.status === "ready" && archive.items.length > 0 && (
        <ul className="flex flex-col gap-4">
          {archive.items.map((news) => (
            <li key={news.number}>
              <Link
                to={newsDetailPath(news.number)}
                className="grid gap-4 rounded-lg border border-slate-400/20 bg-slate-400/5 p-3 transition hover:border-blue-400/50 hover:bg-slate-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:grid-cols-[200px_1fr]"
              >
                <NewsCoverImage
                  cover={news.cover}
                  variant="large"
                  className="aspect-video w-full rounded"
                />
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <NewsTypeBadge type={news.type} />
                    <NewsDate iso={news.publishedAt} lang={lang} />
                  </div>
                  <span className="text-lg font-extrabold leading-snug text-white">
                    {news.title}
                  </span>
                  {news.lead && (
                    <span className="line-clamp-2 text-sm text-slate-400">
                      {news.lead}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {archive.status === "ready" && archive.hasMore && (
        <Button
          variant="tertiary"
          className="self-center"
          disabled={archive.loadingMore}
          onClick={archive.loadMore}
        >
          {t("news.archive.loadMore")}
        </Button>
      )}
    </div>
  );
}

function ArchiveSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="grid gap-4 rounded-lg border border-slate-400/20 p-3 sm:grid-cols-[200px_1fr]"
        >
          <Skeleton className="aspect-video w-full" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
