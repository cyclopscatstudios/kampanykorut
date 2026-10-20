import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "typebox";
import { NEWS_TYPE_SLUGS } from "../../../../../shared/types/news";
import {
  NEWS_PATH,
  renderNewsDetailPage,
  renderNewsListPage,
  renderNewsNotFoundPage,
  renderNewsSitemap,
} from "./news.html";
import {
  decodeCursor,
  encodeCursor,
  NEWS_CACHE_CONTROL,
  resolveNewsLang,
  sendCached,
} from "./news.http";
import { NEWS_LANGS, NEWS_TYPES, type NewsType } from "./news.parse";
import type { NewsRecord, NewsRepository } from "./news.repository";

const HTML = "text/html; charset=utf-8";
const PAGE_SIZE = 12;
const SITEMAP_PAGE_SIZE = 500;

const typeFromSlug = (slug: string | undefined): NewsType | undefined =>
  NEWS_TYPES.find((type) => NEWS_TYPE_SLUGS[type] === slug);

export function newsPages(
  repository: NewsRepository,
  {
    siteUrl,
    cacheControl = NEWS_CACHE_CONTROL,
  }: { siteUrl: string; cacheControl?: string },
): FastifyPluginAsyncTypebox {
  return async (app) => {
    app.get(
      NEWS_PATH,
      {
        schema: {
          hide: true,
          querystring: Type.Object({
            type: Type.Optional(Type.String({ maxLength: 40 })),
            cursor: Type.Optional(Type.String({ maxLength: 200 })),
            lang: Type.Optional(Type.String({ maxLength: 5 })),
          }),
        },
      },
      async (request, reply) => {
        const type = typeFromSlug(request.query.type);
        const lang = await resolveNewsLang(
          repository,
          request.query.lang === "en" ? "en" : "hu",
        );
        const before = request.query.cursor
          ? (decodeCursor(request.query.cursor) ?? undefined)
          : undefined;

        const found = await repository.listArchive({
          lang,
          type,
          before,
          limit: PAGE_SIZE + 1,
        });
        const items = found.slice(0, PAGE_SIZE);

        const query = (extra: Record<string, string>) => {
          const params = new URLSearchParams({
            ...(type ? { type: NEWS_TYPE_SLUGS[type] } : {}),
            ...(lang === "en" ? { lang } : {}),
            ...extra,
          }).toString();
          return params ? `${NEWS_PATH}?${params}` : NEWS_PATH;
        };

        const html = renderNewsListPage({
          items,
          lang,
          type,
          siteUrl,
          path: query(
            request.query.cursor && before
              ? { cursor: request.query.cursor }
              : {},
          ),
          nextPath:
            found.length > PAGE_SIZE
              ? query({ cursor: encodeCursor(items[items.length - 1]!) })
              : null,
        });

        return sendCached(request, reply, cacheControl, html, HTML);
      },
    );

    app.get(
      `${NEWS_PATH}/sitemap.xml`,
      { schema: { hide: true } },
      async (request, reply) => {
        const all: NewsRecord[] = [];

        for (const lang of NEWS_LANGS) {
          let before: NewsRecord | undefined;
          for (;;) {
            const page = await repository.listArchive({
              lang,
              limit: SITEMAP_PAGE_SIZE,
              before,
            });
            all.push(...page);
            if (page.length < SITEMAP_PAGE_SIZE) break;
            before = page[page.length - 1];
          }
        }

        return sendCached(
          request,
          reply,
          cacheControl,
          renderNewsSitemap(all, siteUrl),
          "application/xml; charset=utf-8",
        );
      },
    );

    app.get(
      `${NEWS_PATH}/:number`,
      {
        schema: {
          hide: true,
          params: Type.Object({ number: Type.String({ maxLength: 20 }) }),
        },
      },
      async (request, reply) => {
        const { number } = request.params;
        const news = /^\d{1,9}$/.test(number)
          ? await repository.findVisibleByNumber(Number(number))
          : null;

        if (!news) {
          return reply
            .status(404)
            .type(HTML)
            .header("cache-control", "no-cache")
            .send(
              renderNewsNotFoundPage({
                lang: "hu",
                path: request.url,
                siteUrl,
              }),
            );
        }

        return sendCached(
          request,
          reply,
          cacheControl,
          renderNewsDetailPage({ news, siteUrl }),
          HTML,
        );
      },
    );
  };
}
