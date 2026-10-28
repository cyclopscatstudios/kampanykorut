import { NEWS_TYPE_SLUGS } from "../../../../../shared/types/news";
import { NEWS_TYPES, type NewsLang, type NewsType } from "./news.parse";
import type { NewsRecord } from "./news.repository";

export const NEWS_PATH = "/news";

const STRINGS = {
  hu: {
    locale: "hu-HU",
    ogLocale: "hu_HU",
    title: "Hírek",
    description: "Újdonságok, frissítések és új kampányok a Kampánykörútból.",
    all: "Mind",
    more: "További hírek →",
    back: "← Összes hír",
    play: "Játék indítása",
    comment: "Hozzászólás GitHubon",
    empty: "Még nincs hír ebben a kategóriában.",
    notFound: "Ez a hír nem található.",
    footer: "Kampánykörút — ingyenes, böngészőben futó választási szimuláció.",
    types: {
      "uj-funkcio": "Új funkció",
      frissites: "Frissítés",
      kampany: "Kampány",
      javitas: "Javítás",
    },
  },
  en: {
    locale: "en-GB",
    ogLocale: "en_GB",
    title: "News",
    description: "Features, updates and new campaigns from Kampánykörút.",
    all: "All",
    more: "More news →",
    back: "← All news",
    play: "Start game",
    comment: "Comment on GitHub",
    empty: "There is no news in this category yet.",
    notFound: "This news item could not be found.",
    footer:
      "Kampánykörút — a free election simulation that runs in your browser.",
    types: {
      "uj-funkcio": "New feature",
      frissites: "Update",
      kampany: "Campaign",
      javitas: "Fix",
    },
  },
} satisfies Record<NewsLang, unknown>;

const DEFAULT_IMAGE = "/parlament_night.jpg";

const STYLES = `
*{box-sizing:border-box}
@font-face{font-family:Montserrat;font-style:normal;font-weight:300 700;font-display:swap;src:url(/fonts/montserrat-latin-ext.woff2) format("woff2");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:Montserrat;font-style:normal;font-weight:300 700;font-display:swap;src:url(/fonts/montserrat-latin.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
body{margin:0;background:#0f172a;color:#e2e8f0;font-family:Montserrat,system-ui,sans-serif;line-height:1.6}
a{color:#60a5fa;text-decoration:none}a:hover{color:#93c5fd}
.wrap{max-width:64rem;margin:0 auto;padding:0 1.5rem}
header{border-bottom:1px solid rgba(255,255,255,.1)}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding-top:1rem;padding-bottom:1rem}
.brand{display:flex;align-items:center;gap:.6rem;color:#fff;font-weight:800;font-size:1.1rem}
.brand img{width:32px;height:32px}.brand b{color:#3b65d4;font-weight:800}
.nav{display:flex;align-items:center;gap:1rem;font-size:.8rem;font-weight:700}
.play{background:#3b65d4;color:#fff;padding:.55rem 1rem;border-radius:6px;white-space:nowrap}.play:hover{color:#fff;background:#2952c8}
main{padding:2.5rem 0 3rem}
h1{margin:0 0 .5rem;font-size:2.25rem;line-height:1.15;font-weight:800;color:#fff;letter-spacing:-.02em}
.sub{color:#94a3b8;margin:0 0 1.5rem}
.filters{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2rem}
.filters a{border:1px solid rgba(148,163,184,.25);border-radius:6px;padding:.3rem .75rem;font-size:.75rem;font-weight:700;color:#cbd5e1}
.filters a.on{background:#3b65d4;border-color:#3b65d4;color:#fff}
.list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:1rem}
.card{display:grid;grid-template-columns:200px 1fr;gap:1rem;padding:.75rem;border:1px solid rgba(148,163,184,.2);border-radius:8px;background:rgba(148,163,184,.05);color:inherit}
.card:hover{border-color:rgba(96,165,250,.5);color:inherit}
.card img,.ph{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:4px}
.ph{background:repeating-linear-gradient(135deg,rgba(148,163,184,.1) 0 8px,rgba(148,163,184,.04) 8px 16px)}
.card h2{margin:.25rem 0;font-size:1.1rem;color:#fff;line-height:1.3}
.card p{margin:0;color:#94a3b8;font-size:.875rem}
.meta{display:flex;align-items:center;gap:.75rem}
.badge{display:inline-block;background:#e0a23b;color:#1a1206;font-size:.6rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;padding:.15rem .4rem;border-radius:4px}
time{font-family:ui-monospace,monospace;font-size:.7rem;color:#64748b}
.more{display:block;margin-top:2rem;text-align:center;font-weight:700}
article{max-width:48rem;margin:0 auto}
article .cover{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px;margin:1.5rem 0 1rem}
.content{color:#cbd5e1}.content img{max-width:100%;height:auto;border-radius:6px}
.content h2,.content h3{color:#fff}.content strong{color:#fff}
.content blockquote{margin:0;border-left:2px solid rgba(96,165,250,.6);padding-left:1rem;color:#94a3b8}
.foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;border-top:1px solid rgba(255,255,255,.1);margin-top:2rem;padding-top:1.25rem}
.cta{background:#3b65d4;color:#fff;font-weight:700;font-size:.875rem;padding:.6rem 1rem;border-radius:6px}.cta:hover{color:#fff;background:#2952c8}
.gh{font-size:.75rem;font-weight:600;color:#64748b}
footer{border-top:1px solid rgba(255,255,255,.1);padding:2rem 0;text-align:center;font-size:.75rem;color:#64748b}
@media (max-width:640px){.card{grid-template-columns:1fr}h1{font-size:1.75rem}.brand{font-size:1rem}.nav{gap:.75rem}.play{padding:.5rem .75rem}}
`;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const attr = escapeHtml;

function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function absoluteUrl(siteUrl: string, url: string): string {
  return new URL(url, `${siteUrl}/`).href;
}

function formatDate(date: Date, lang: NewsLang): string {
  return new Intl.DateTimeFormat(STRINGS[lang].locale, {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function withLang(path: string, lang: NewsLang): string {
  if (lang === "hu") return path;
  return `${path}${path.includes("?") ? "&" : "?"}lang=${lang}`;
}

function badge(type: NewsType | null, lang: NewsLang): string {
  return type
    ? `<span class="badge">${escapeHtml(STRINGS[lang].types[type])}</span>`
    : "";
}

function meta(news: NewsRecord, lang: NewsLang): string {
  return `<div class="meta">${badge(news.type, lang)}<time datetime="${news.publishedAt.toISOString()}">${formatDate(news.publishedAt, lang)}</time></div>`;
}

interface LayoutOptions {
  lang: NewsLang;
  siteUrl: string;
  title: string;
  description: string;
  path: string;
  ogType: "website" | "article";
  image: string | null;
  head?: string;
  body: string;
  robots?: string;
}

function layout(options: LayoutOptions): string {
  const { lang, siteUrl, title, description, path, ogType, body } = options;
  const t = STRINGS[lang];
  const canonical = absoluteUrl(siteUrl, path);
  const image = absoluteUrl(siteUrl, options.image ?? DEFAULT_IMAGE);

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${attr(description)}">
${options.robots ? `<meta name="robots" content="${options.robots}">` : ""}
<link rel="canonical" href="${attr(canonical)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta property="og:site_name" content="Kampánykörút">
<meta property="og:locale" content="${t.ogLocale}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${attr(canonical)}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:image" content="${attr(image)}">
<meta name="twitter:card" content="summary_large_image">
${options.head ?? ""}
<style>${STYLES}</style>
</head>
<body>
<header><div class="wrap">
<a class="brand" href="/"><img src="/favicon.svg" alt="" width="32" height="32"><span>Kampány<b>körút</b></span></a>
<nav class="nav"><a href="${withLang(NEWS_PATH, lang)}">${t.title}</a><a class="play" href="/">${t.play}</a></nav>
</div></header>
<main><div class="wrap">${body}</div></main>
<footer><div class="wrap">${t.footer}</div></footer>
</body>
</html>`;
}

export function renderNewsListPage(options: {
  items: NewsRecord[];
  lang: NewsLang;
  type: NewsType | undefined;
  nextPath: string | null;
  path: string;
  siteUrl: string;
}): string {
  const { items, lang, type, nextPath, path, siteUrl } = options;
  const t = STRINGS[lang];

  const filters = [
    `<a href="${withLang(NEWS_PATH, lang)}"${type ? "" : ' class="on"'}>${t.all}</a>`,
    ...NEWS_TYPES.map(
      (option) =>
        `<a href="${withLang(`${NEWS_PATH}?type=${NEWS_TYPE_SLUGS[option]}`, lang)}"${option === type ? ' class="on"' : ""}>${escapeHtml(t.types[option])}</a>`,
    ),
  ].join("");

  const list = items.length
    ? `<ul class="list">${items
        .map(
          (news) =>
            `<li><a class="card" href="${NEWS_PATH}/${news.number}">${
              news.cover
                ? `<img src="${attr(news.cover.large16x9Url)}" alt="" loading="lazy">`
                : '<div class="ph"></div>'
            }<div>${meta(news, lang)}<h2>${escapeHtml(news.title)}</h2>${
              news.lead ? `<p>${escapeHtml(news.lead)}</p>` : ""
            }</div></a></li>`,
        )
        .join("")}</ul>`
    : `<p class="sub">${t.empty}</p>`;

  return layout({
    lang,
    siteUrl,
    title: `${t.title} – Kampánykörút`,
    description: t.description,
    path,
    ogType: "website",
    image: items.find((news) => news.cover)?.cover?.large16x9Url ?? null,
    head: nextPath
      ? `<link rel="next" href="${attr(absoluteUrl(siteUrl, nextPath))}">`
      : "",
    body: `<h1>${t.title}</h1><p class="sub">${t.description}</p><nav class="filters">${filters}</nav>${list}${
      nextPath ? `<a class="more" href="${attr(nextPath)}">${t.more}</a>` : ""
    }`,
  });
}

export function renderNewsDetailPage(options: {
  news: NewsRecord;
  siteUrl: string;
}): string {
  const { news, siteUrl } = options;
  const lang = news.lang;
  const t = STRINGS[lang];
  const path = `${NEWS_PATH}/${news.number}`;
  const description = news.lead || t.description;
  const ctaExternal =
    news.cta && new URL(news.cta.url).origin !== new URL(siteUrl).origin;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description,
    image: news.cover ? [absoluteUrl(siteUrl, news.cover.large16x9Url)] : [],
    datePublished: news.publishedAt.toISOString(),
    dateModified: news.updatedAt.toISOString(),
    inLanguage: lang,
    mainEntityOfPage: absoluteUrl(siteUrl, path),
    author: { "@type": "Organization", name: "Kampánykörút", url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: "Kampánykörút",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(siteUrl, "/apple-touch-icon.png"),
      },
    },
  };

  const head = [
    `<meta property="article:published_time" content="${news.publishedAt.toISOString()}">`,
    `<meta property="article:modified_time" content="${news.updatedAt.toISOString()}">`,
    news.cover
      ? '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="675">'
      : "",
    `<script type="application/ld+json">${jsonLd(structuredData)}</script>`,
  ].join("\n");

  const cta = news.cta
    ? `<a class="cta" href="${attr(news.cta.url)}"${
        ctaExternal ? ' target="_blank" rel="noopener noreferrer"' : ""
      }>${escapeHtml(news.cta.label)}</a>`
    : "<span></span>";

  return layout({
    lang,
    siteUrl,
    title: `${news.title} – Kampánykörút`,
    description,
    path,
    ogType: "article",
    image: news.cover?.large16x9Url ?? null,
    head,
    body: `<article><a href="${withLang(NEWS_PATH, lang)}">${t.back}</a>${
      news.cover
        ? `<img class="cover" src="${attr(news.cover.large16x9Url)}" alt="">`
        : ""
    }${meta(news, lang)}<h1>${escapeHtml(news.title)}</h1><div class="content">${news.html}</div><div class="foot">${cta}<a class="gh" href="${attr(news.url)}" target="_blank" rel="noopener noreferrer">${t.comment}</a></div></article>`,
  });
}

export function renderNewsNotFoundPage(options: {
  lang: NewsLang;
  path: string;
  siteUrl: string;
}): string {
  const t = STRINGS[options.lang];
  return layout({
    ...options,
    title: `${t.title} – Kampánykörút`,
    description: t.description,
    ogType: "website",
    image: null,
    robots: "noindex",
    body: `<a href="${withLang(NEWS_PATH, options.lang)}">${t.back}</a><h1 style="margin-top:1.5rem">${t.notFound}</h1>`,
  });
}

export function renderNewsSitemap(items: NewsRecord[], siteUrl: string) {
  const urls = [
    `<url><loc>${absoluteUrl(siteUrl, NEWS_PATH)}</loc><changefreq>daily</changefreq><priority>0.6</priority></url>`,
    ...items.map(
      (news) =>
        `<url><loc>${absoluteUrl(siteUrl, `${NEWS_PATH}/${news.number}`)}</loc><lastmod>${news.updatedAt.toISOString()}</lastmod></url>`,
    ),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}
