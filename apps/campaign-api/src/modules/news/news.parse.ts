import MarkdownIt from "markdown-it";
import type { NewsDiscussion } from "./news.github";

export const NEWS_TYPES = [
  "uj-funkcio",
  "frissites",
  "kampany",
  "javitas",
] as const;
export type NewsType = (typeof NEWS_TYPES)[number];
export type NewsLang = "hu" | "en";

export interface NewsCta {
  label: string;
  url: string;
}

export interface ParsedNews {
  githubId: string;
  number: number;
  title: string;
  type: NewsType | null;
  lang: NewsLang;
  lead: string;
  markdown: string;
  coverSourceUrl: string | null;
  cta: NewsCta | null;
  url: string;
  isPinned: boolean;
  visible: boolean;
  expiresAt: Date | null;
  publishedAt: Date;
  updatedAt: Date;
}

type Token = ReturnType<MarkdownIt["parse"]>[number];

interface Block {
  start: number;
  end: number;
  tokens: Token[];
}

const md = new MarkdownIt({ html: true });

const EXPIRY_LINE = /^\s*lej[aá]r(?:at)?\s*:\s*(\d{4})-(\d{2})-(\d{2})\s*$/i;
const IMAGE_SOURCE =
  /\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)|!\[[^\]]*\]\([^)]*\)|<img\b[^>]*>/i;
const HTML_IMG_SRC = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i;
const HTTP_URL = /^https?:\/\//i;
const TIME_ZONE = "Europe/Budapest";

export function parseNewsDiscussion(
  discussion: NewsDiscussion,
  { isNews }: { isNews: boolean },
): ParsedNews {
  const body = discussion.markdown.replace(/\r\n?/g, "\n");
  const expiry = extractExpiry(body);
  const cover = extractCover(expiry.markdown);
  const cta = extractCta(cover.markdown);
  const labels = discussion.labels.map((label) => label.toLowerCase());

  return {
    githubId: discussion.githubId,
    number: discussion.number,
    title: discussion.title.trim(),
    type: NEWS_TYPES.find((type) => labels.includes(type)) ?? null,
    lang: labels.includes("lang:en") ? "en" : "hu",
    lead: extractLead(cta.markdown),
    markdown: cta.markdown,
    coverSourceUrl: cover.coverSourceUrl,
    cta: cta.cta,
    url: discussion.url,
    isPinned: discussion.isPinned,
    visible: isNews && !discussion.closed,
    expiresAt: expiry.expiresAt,
    publishedAt: discussion.createdAt,
    updatedAt: discussion.updatedAt,
  };
}

function extractExpiry(markdown: string) {
  const lines = markdown.split("\n");
  let last = lines.length - 1;
  while (last >= 0 && lines[last]!.trim() === "") last--;

  const match = last >= 0 ? EXPIRY_LINE.exec(lines[last]!) : null;
  const expiresAt = match
    ? startOfNextDayInBudapest(+match[1]!, +match[2]!, +match[3]!)
    : null;

  if (!expiresAt) return { markdown: tidy(markdown), expiresAt: null };
  return { markdown: tidy(lines.slice(0, last).join("\n")), expiresAt };
}

function extractCover(markdown: string) {
  const lines = markdown.split("\n");

  for (const block of topLevelBlocks(markdown)) {
    const src = firstImageSrc(block.tokens);
    if (!src) continue;

    const remaining = lines
      .slice(block.start, block.end)
      .join("\n")
      .replace(IMAGE_SOURCE, "");
    const isEmpty = remaining.replace(/<[^>]*>/g, "").trim() === "";
    lines.splice(
      block.start,
      block.end - block.start,
      ...(isEmpty ? [] : remaining.split("\n")),
    );

    return { markdown: tidy(lines.join("\n")), coverSourceUrl: src };
  }

  return { markdown, coverSourceUrl: null };
}

function extractCta(markdown: string): {
  markdown: string;
  cta: NewsCta | null;
} {
  const last = topLevelBlocks(markdown).at(-1);
  const children = last && paragraphChildren(last);
  const meaningful = (children ?? []).filter(
    (t) => t.type !== "softbreak" && !(t.type === "text" && !t.content.trim()),
  );
  const [open, ...rest] = meaningful;
  const close = rest.pop();

  if (
    !last ||
    open?.type !== "link_open" ||
    close?.type !== "link_close" ||
    rest.some((t) => t.type === "link_open")
  ) {
    return { markdown, cta: null };
  }

  const url = open.attrGet("href");
  const label = plainText(rest);
  if (!url || !HTTP_URL.test(url) || !label) return { markdown, cta: null };

  const lines = markdown.split("\n");
  lines.splice(last.start, last.end - last.start);
  return { markdown: tidy(lines.join("\n")), cta: { label, url } };
}

function extractLead(markdown: string): string {
  for (const block of topLevelBlocks(markdown)) {
    const text = plainText(paragraphChildren(block) ?? []);
    if (text) return text;
  }
  return "";
}

function topLevelBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  let current: Block | undefined;

  for (const token of md.parse(markdown, {})) {
    if (token.level === 0 && token.nesting !== -1 && token.map) {
      current = { start: token.map[0], end: token.map[1], tokens: [] };
      blocks.push(current);
    }
    current?.tokens.push(token);
  }

  return blocks;
}

function paragraphChildren(block: Block): Token[] | null {
  if (block.tokens[0]?.type !== "paragraph_open") return null;
  return block.tokens.find((t) => t.type === "inline")?.children ?? null;
}

function firstImageSrc(tokens: Token[]): string | null {
  for (const token of tokens) {
    const src =
      token.type === "image"
        ? token.attrGet("src")
        : token.type === "html_block" || token.type === "html_inline"
          ? (HTML_IMG_SRC.exec(token.content)?.[1] ?? null)
          : token.children
            ? firstImageSrc(token.children)
            : null;

    if (src && HTTP_URL.test(src)) return src;
  }
  return null;
}

function plainText(tokens: Token[]): string {
  return tokens
    .map((t) =>
      t.type === "text" || t.type === "code_inline"
        ? t.content
        : t.type === "softbreak" || t.type === "hardbreak"
          ? " "
          : "",
    )
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function tidy(markdown: string): string {
  return markdown.replace(/\n{3,}/g, "\n\n").trim();
}

function startOfNextDayInBudapest(
  year: number,
  month: number,
  day: number,
): Date | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }

  const nextMidnightUtc = Date.UTC(year, month - 1, day + 1);
  return new Date(nextMidnightUtc - utcOffsetMs(new Date(nextMidnightUtc)));
}

function utcOffsetMs(at: Date): number {
  const offset = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    timeZoneName: "longOffset",
  })
    .formatToParts(at)
    .find((part) => part.type === "timeZoneName")?.value;
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(offset ?? "");
  if (!match) return 0;

  const minutes = +match[2]! * 60 + +match[3]!;
  return (match[1] === "-" ? -minutes : minutes) * 60_000;
}
