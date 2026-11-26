import {
  buildMetaEntries,
  type MetaEntry,
  type PageMeta,
} from "../components/ui/campaignPage/campaignPage.data";

const escapeAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function toTag(entry: MetaEntry) {
  return entry.kind === "canonical"
    ? `<link rel="canonical" href="${escapeAttr(entry.href)}" />`
    : `<meta ${entry.attr}="${entry.key}" content="${escapeAttr(entry.content)}" />`;
}

function removeExisting(html: string, entry: MetaEntry) {
  const pattern =
    entry.kind === "canonical"
      ? /<link\b[^>]*\brel="canonical"[^>]*>\s*/g
      : new RegExp(
          `<meta\\b[^>]*\\b${entry.attr}="${escapeRegExp(entry.key)}"[^>]*>\\s*`,
          "g",
        );
  return html.replace(pattern, "");
}

export function applyMetaToHtml(
  template: string,
  meta: PageMeta,
  body: string,
  origin?: string,
  jsonLd?: object,
) {
  const entries = buildMetaEntries(meta, origin);
  const withoutOld = entries.reduce(removeExisting, template);
  const tags = entries.map(toTag).join("\n    ");
  const withJsonLd = jsonLd
    ? withoutOld.replace(
        /(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/,
        (_, open: string, close: string) =>
          `${open}${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}${close}`,
      )
    : withoutOld;
  return withJsonLd
    .replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${escapeAttr(meta.title)}</title>\n    ${tags}`,
    )
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}
