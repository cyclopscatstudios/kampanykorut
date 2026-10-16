import { createHash } from "node:crypto";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { type TSchema, Type } from "typebox";
import { NEWS_TYPES, type NewsLang } from "./news.parse";
import type {
  ArchiveCursor,
  NewsRecord,
  NewsRepository,
} from "./news.repository";

export const NEWS_CACHE_CONTROL = "public, max-age=300";

const Nullable = <T extends TSchema>(schema: T) =>
  Type.Union([schema, Type.Null()]);

const NewsTypeSchema = Type.Union(NEWS_TYPES.map((t) => Type.Literal(t)));
const LangSchema = Type.Union([Type.Literal("hu"), Type.Literal("en")]);

const NewsItem = Type.Object({
  number: Type.Integer(),
  title: Type.String(),
  type: Nullable(NewsTypeSchema),
  lang: LangSchema,
  lead: Type.String(),
  cover: Nullable(
    Type.Object({ large16x9Url: Type.String(), thumbUrl: Type.String() }),
  ),
  cta: Nullable(Type.Object({ label: Type.String(), url: Type.String() })),
  url: Type.String({ description: "Discussion on GitHub, for comments" }),
  isPinned: Type.Boolean(),
  publishedAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  expiresAt: Nullable(Type.String({ format: "date-time" })),
});

const NewsDetail = Type.Intersect([
  NewsItem,
  Type.Object({ html: Type.String() }),
]);

function toItem(news: NewsRecord) {
  return {
    number: news.number,
    title: news.title,
    type: news.type,
    lang: news.lang,
    lead: news.lead,
    cover: news.cover,
    cta: news.cta,
    url: news.url,
    isPinned: news.isPinned,
    publishedAt: news.publishedAt.toISOString(),
    updatedAt: news.updatedAt.toISOString(),
    expiresAt: news.expiresAt?.toISOString() ?? null,
  };
}

function encodeCursor(news: NewsRecord): string {
  return Buffer.from(
    `${news.publishedAt.toISOString()}_${news.number}`,
  ).toString("base64url");
}

function decodeCursor(cursor: string): ArchiveCursor | null {
  const [date, number] = Buffer.from(cursor, "base64url").toString().split("_");
  const publishedAt = new Date(date ?? "");
  const parsedNumber = Number(number);

  if (Number.isNaN(publishedAt.getTime()) || !Number.isInteger(parsedNumber)) {
    return null;
  }
  return { publishedAt, number: parsedNumber };
}

function sendCached<T>(
  request: FastifyRequest,
  reply: FastifyReply,
  cacheControl: string,
  body: T,
) {
  const etag = `"${createHash("sha1").update(JSON.stringify(body)).digest("base64url")}"`;
  reply.header("cache-control", cacheControl).header("etag", etag);

  if (request.headers["if-none-match"] === etag) {
    return reply.status(304).send();
  }
  return reply.send(body);
}

export function newsRoutes(
  repository: NewsRepository,
  {
    cacheControl = NEWS_CACHE_CONTROL,
    now = () => new Date(),
  }: { cacheControl?: string; now?: () => Date } = {},
): FastifyPluginAsyncTypebox {
  const resolveLang = async (lang: NewsLang = "hu"): Promise<NewsLang> =>
    lang === "hu" || (await repository.hasVisible(lang)) ? lang : "hu";

  return async (app) => {
    app.get(
      "/api/v1/news",
      {
        schema: {
          tags: ["news"],
          summary: "Visible, not expired news; pinned first, then newest",
          querystring: Type.Object({
            limit: Type.Integer({ minimum: 1, maximum: 20, default: 5 }),
            lang: Type.Optional(LangSchema),
          }),
          response: { 200: Type.Object({ items: Type.Array(NewsItem) }) },
        },
      },
      async (request, reply) => {
        const items = await repository.listActive({
          lang: await resolveLang(request.query.lang),
          limit: request.query.limit,
          now: now(),
        });
        return sendCached(request, reply, cacheControl, {
          items: items.map(toItem),
        });
      },
    );

    app.get(
      "/api/v1/news/archive",
      {
        schema: {
          tags: ["news"],
          summary: "Every published news item, expired ones included",
          querystring: Type.Object({
            limit: Type.Integer({ minimum: 1, maximum: 50, default: 12 }),
            lang: Type.Optional(LangSchema),
            type: Type.Optional(NewsTypeSchema),
            cursor: Type.Optional(Type.String({ maxLength: 200 })),
          }),
          response: {
            200: Type.Object({
              items: Type.Array(NewsItem),
              nextCursor: Nullable(Type.String()),
            }),
          },
        },
      },
      async (request, reply) => {
        const { limit, lang, type, cursor } = request.query;
        const before = cursor ? decodeCursor(cursor) : undefined;

        if (before === null) {
          throw Object.assign(new Error("Invalid cursor"), { statusCode: 400 });
        }

        const items = await repository.listArchive({
          lang: await resolveLang(lang),
          limit: limit + 1,
          type,
          before,
        });
        const page = items.slice(0, limit);

        return sendCached(request, reply, cacheControl, {
          items: page.map(toItem),
          nextCursor:
            items.length > limit ? encodeCursor(page[page.length - 1]!) : null,
        });
      },
    );

    app.get(
      "/api/v1/news/:number",
      {
        schema: {
          tags: ["news"],
          summary: "One news item with its sanitized HTML body",
          params: Type.Object({ number: Type.Integer({ minimum: 1 }) }),
          response: { 200: NewsDetail },
        },
      },
      async (request, reply) => {
        const news = await repository.findVisibleByNumber(
          request.params.number,
        );

        if (!news) {
          throw Object.assign(new Error("News not found"), { statusCode: 404 });
        }

        return sendCached(request, reply, cacheControl, {
          ...toItem(news),
          html: news.html,
        });
      },
    );
  };
}
