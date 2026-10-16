import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const md = new MarkdownIt({ html: true, linkify: true, breaks: true });

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "del",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "h2",
  "h3",
  "blockquote",
];

const HTTP_URL = /^https?:\/\//i;

export function collectImageSources(markdown: string): string[] {
  const sources: string[] = [];

  sanitizeHtml(md.render(markdown), {
    allowedTags: ["img"],
    allowedAttributes: { img: ["src"] },
    transformTags: {
      img: (tagName, attribs) => {
        if (attribs.src && HTTP_URL.test(attribs.src))
          sources.push(attribs.src);
        return { tagName, attribs };
      },
    },
  });

  return [...new Set(sources)];
}

export function renderNewsHtml(
  markdown: string,
  resolveImage: (sourceUrl: string) => string | null,
): string {
  return sanitizeHtml(md.render(markdown), {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    transformTags: {
      h1: "h2",
      h4: "h3",
      h5: "h3",
      h6: "h3",
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external: sanitizeHtml.Attributes = HTTP_URL.test(href)
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {};
        return { tagName, attribs: { href, ...external } };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: {
          src: (attribs.src && resolveImage(attribs.src)) || "",
          alt: attribs.alt ?? "",
          loading: "lazy",
        },
      }),
    },
    exclusiveFilter: (frame) =>
      (frame.tag === "img" && !frame.attribs.src) ||
      (frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren.length),
  }).trim();
}
