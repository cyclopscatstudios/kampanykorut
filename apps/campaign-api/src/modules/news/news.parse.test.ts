import { describe, expect, it } from "vitest";
import { discussionNode } from "./__fixtures__/discussions";
import type { NewsDiscussion } from "./news.github";
import { parseNewsDiscussion } from "./news.parse";

const discussion = (
  body: string,
  overrides: Partial<NewsDiscussion> = {},
): NewsDiscussion => ({
  githubId: "D_kwDO42",
  number: 42,
  title: "  Megérkezett a 2026-os kampány ",
  markdown: body,
  url: discussionNode().url,
  createdAt: new Date("2026-10-10T08:00:00Z"),
  updatedAt: new Date("2026-10-11T09:30:00Z"),
  closed: false,
  isPinned: false,
  upvoteCount: 0,
  commentCount: 0,
  categoryId: "DIC_news",
  labels: [],
  ...overrides,
});

const parse = (body: string, overrides: Partial<NewsDiscussion> = {}) =>
  parseNewsDiscussion(discussion(body, overrides), { isNews: true });

describe("parseNewsDiscussion", () => {
  it("extracts cover, lead, CTA and expiry from a full announcement", () => {
    const news = parse(
      [
        "![borító](https://github.com/user-attachments/assets/abc)",
        "",
        "Mostantól a **2026-os** választás is",
        "végigjátszható.",
        "",
        "## Mi változott?",
        "",
        "- új jelöltek",
        "",
        "[Kipróbálom →](https://kampanykorut.hu/kampany/2026)",
        "",
        "lejár: 2026-11-01",
        "",
      ].join("\r\n"),
      { labels: ["Kampany"], isPinned: true },
    );

    expect(news).toMatchObject({
      title: "Megérkezett a 2026-os kampány",
      type: "kampany",
      lang: "hu",
      coverSourceUrl: "https://github.com/user-attachments/assets/abc",
      lead: "Mostantól a 2026-os választás is végigjátszható.",
      cta: {
        label: "Kipróbálom →",
        url: "https://kampanykorut.hu/kampany/2026",
      },
      markdown: [
        "Mostantól a **2026-os** választás is",
        "végigjátszható.",
        "",
        "## Mi változott?",
        "",
        "- új jelöltek",
      ].join("\n"),
      isPinned: true,
      visible: true,
      expiresAt: new Date("2026-11-01T23:00:00Z"),
      publishedAt: new Date("2026-10-10T08:00:00Z"),
    });
  });

  it("handles a plain announcement without optional parts", () => {
    const news = parse("Csak egy rövid hír, link nélkül.");

    expect(news).toMatchObject({
      type: null,
      lead: "Csak egy rövid hír, link nélkül.",
      coverSourceUrl: null,
      cta: null,
      expiresAt: null,
      markdown: "Csak egy rövid hír, link nélkül.",
    });
  });

  it("takes the cover from an HTML img tag GitHub inserts for resized images", () => {
    const news = parse(
      [
        '<img width="1280" alt="Image" src="https://github.com/user-attachments/assets/def" />',
        "",
        "Bevezető.",
      ].join("\n"),
    );

    expect(news.coverSourceUrl).toBe(
      "https://github.com/user-attachments/assets/def",
    );
    expect(news.markdown).toBe("Bevezető.");
  });

  it("removes only the image when it shares a paragraph with text", () => {
    const news = parse(
      "Nézd meg: ![kép](https://example.com/a.png) itt.\n\nMásodik bekezdés.",
    );

    expect(news.coverSourceUrl).toBe("https://example.com/a.png");
    expect(news.markdown).toBe("Nézd meg:  itt.\n\nMásodik bekezdés.");
    expect(news.lead).toBe("Nézd meg: itt.");
  });

  it("uses the first image even when it is not at the top", () => {
    const news = parse(
      "Bevezető.\n\n![első](https://example.com/1.png)\n\n![második](https://example.com/2.png)",
    );

    expect(news.coverSourceUrl).toBe("https://example.com/1.png");
    expect(news.markdown).toBe(
      "Bevezető.\n\n![második](https://example.com/2.png)",
    );
  });

  it("does not treat a last paragraph with extra text as a CTA", () => {
    const news = parse(
      "Bevezető.\n\nRészletek [itt](https://example.com) olvashatók.",
    );

    expect(news.cta).toBeNull();
    expect(news.markdown).toContain("olvashatók");
  });

  it("ignores CTA links that are not http(s)", () => {
    expect(parse("Bevezető.\n\n[Katt](javascript:alert(1))").cta).toBeNull();
  });

  it("keeps an invalid or misplaced expiry line in the text", () => {
    expect(parse("Bevezető.\n\nlejár: 2026-02-30")).toMatchObject({
      expiresAt: null,
      markdown: "Bevezető.\n\nlejár: 2026-02-30",
    });
    expect(parse("lejár: 2026-11-01\n\nBevezető.").expiresAt).toBeNull();
  });

  it("expires at midnight Budapest time in winter and summer", () => {
    expect(parse("Hír.\n\nLejárat: 2026-01-15").expiresAt).toEqual(
      new Date("2026-01-15T23:00:00Z"),
    );
    expect(parse("Hír.\n\nlejar: 2026-07-15").expiresAt).toEqual(
      new Date("2026-07-15T22:00:00Z"),
    );
  });

  it("reads type and language from labels", () => {
    expect(
      parse("Hír.", { labels: ["bug", "uj-funkcio", "lang:en"] }),
    ).toMatchObject({ type: "uj-funkcio", lang: "en" });
  });

  it("hides closed discussions and those outside the news category", () => {
    expect(parse("Hír.", { closed: true }).visible).toBe(false);
    expect(
      parseNewsDiscussion(discussion("Hír."), { isNews: false }).visible,
    ).toBe(false);
  });
});
