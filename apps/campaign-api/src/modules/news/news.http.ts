import { createHash } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { NewsLang } from "./news.parse";
import type {
  ArchiveCursor,
  NewsRecord,
  NewsRepository,
} from "./news.repository";

export const NEWS_CACHE_CONTROL = "public, max-age=300";

export async function resolveNewsLang(
  repository: NewsRepository,
  lang: NewsLang = "hu",
): Promise<NewsLang> {
  return lang === "hu" || (await repository.hasVisible(lang)) ? lang : "hu";
}

export function encodeCursor(news: NewsRecord): string {
  return Buffer.from(
    `${news.publishedAt.toISOString()}_${news.number}`,
  ).toString("base64url");
}

export function decodeCursor(cursor: string): ArchiveCursor | null {
  const [date, number] = Buffer.from(cursor, "base64url").toString().split("_");
  const publishedAt = new Date(date ?? "");
  const parsedNumber = Number(number);

  if (Number.isNaN(publishedAt.getTime()) || !Number.isInteger(parsedNumber)) {
    return null;
  }
  return { publishedAt, number: parsedNumber };
}

export function sendCached<T>(
  request: FastifyRequest,
  reply: FastifyReply,
  cacheControl: string,
  body: T,
  type?: string,
) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  const etag = `"${createHash("sha1").update(payload).digest("base64url")}"`;
  reply.header("cache-control", cacheControl).header("etag", etag);

  if (request.headers["if-none-match"] === etag) {
    return reply.status(304).send();
  }
  if (type) reply.type(type);
  return reply.send(body);
}
