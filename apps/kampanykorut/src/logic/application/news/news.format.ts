import type { NewsLang } from "@/shared/types";

const LOCALES: Record<NewsLang, string> = { hu: "hu-HU", en: "en-GB" };
const TIME_ZONE = "Europe/Budapest";

export function formatNewsDate(
  iso: string,
  lang: NewsLang,
  { now = new Date(), short = false }: { now?: Date; short?: boolean } = {},
): string {
  const date = new Date(iso);
  const year = (d: Date) =>
    new Intl.DateTimeFormat("en", {
      timeZone: TIME_ZONE,
      year: "numeric",
    }).format(d);
  const sameYear = year(date) === year(now);

  return new Intl.DateTimeFormat(LOCALES[lang], {
    timeZone: TIME_ZONE,
    year: short && sameYear ? undefined : "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function isExternalUrl(url: string, origin = window.location.origin) {
  try {
    return new URL(url, origin).origin !== origin;
  } catch {
    return true;
  }
}
