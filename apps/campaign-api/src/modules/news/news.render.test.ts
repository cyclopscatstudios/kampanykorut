import { describe, expect, it } from "vitest";
import { collectImageSources, renderNewsHtml } from "./news.render";

const keepNone = () => null;

describe("renderNewsHtml", () => {
  it("renders the allowed markdown subset", () => {
    const html = renderNewsHtml(
      [
        "# Cím",
        "",
        "**Fontos** és _dőlt_ szöveg,",
        "új sorban folytatva.",
        "",
        "- egy",
        "- kettő",
        "",
        "> idézet",
      ].join("\n"),
      keepNone,
    );

    expect(html).toBe(
      [
        "<h2>Cím</h2>",
        "<p><strong>Fontos</strong> és <em>dőlt</em> szöveg,<br />",
        "új sorban folytatva.</p>",
        "<ul>",
        "<li>egy</li>",
        "<li>kettő</li>",
        "</ul>",
        "<blockquote>",
        "<p>idézet</p>",
        "</blockquote>",
      ].join("\n"),
    );
  });

  it("opens external links in a new tab without leaking the referrer", () => {
    expect(
      renderNewsHtml(
        "[Játék](https://kampanykorut.hu) és https://example.com",
        keepNone,
      ),
    ).toBe(
      '<p><a href="https://kampanykorut.hu" target="_blank" rel="noopener noreferrer">Játék</a> és ' +
        '<a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com</a></p>',
    );
  });

  it("strips scripts, event handlers and dangerous URLs", () => {
    const html = renderNewsHtml(
      [
        "<script>alert(1)</script>",
        "",
        '<p onclick="alert(1)">Szöveg</p>',
        "",
        "[link](javascript:alert(1))",
        "",
        '<iframe src="https://evil.example"></iframe>',
      ].join("\n"),
      keepNone,
    );

    expect(html).not.toMatch(/<script|onclick|href="javascript|<iframe/i);
    expect(html).toContain("<p>Szöveg</p>");
  });

  it("points images at the copied version and drops the rest", () => {
    const html = renderNewsHtml(
      [
        "![kép](https://github.com/user-attachments/assets/a)",
        "",
        '<img src="https://github.com/user-attachments/assets/b" onerror="x">',
      ].join("\n"),
      (src) =>
        src.endsWith("/a") ? "https://cdn.test/news/a/inline.webp" : null,
    );

    expect(html).toBe(
      '<p><img src="https://cdn.test/news/a/inline.webp" alt="kép" loading="lazy" /></p>',
    );
  });
});

describe("collectImageSources", () => {
  it("lists markdown and HTML image sources once", () => {
    expect(
      collectImageSources(
        [
          "![a](https://example.com/a.png) ![a](https://example.com/a.png)",
          "",
          "<img alt='b' src='https://example.com/b.png'>",
          "",
          "![relatív](/x.png)",
        ].join("\n"),
      ),
    ).toEqual(["https://example.com/a.png", "https://example.com/b.png"]);
  });
});
