import { afterEach, describe, expect, it, vi } from "vitest";
import { formatNewsDate, isExternalUrl } from "./news.format";
import {
  fetchLatestNews,
  fetchNewsArchive,
  fetchNewsDetail,
  NewsNotFoundError,
} from "./newsApi";

describe("formatNewsDate", () => {
  const now = new Date("2026-10-16T12:00:00Z");

  it("formats dates in Budapest time", () => {
    expect(formatNewsDate("2026-10-12T08:00:00Z", "hu", { now })).toBe(
      "2026. okt. 12.",
    );
    expect(formatNewsDate("2026-10-11T22:30:00Z", "hu", { now })).toBe(
      "2026. okt. 12.",
    );
    expect(formatNewsDate("2026-10-12T08:00:00Z", "en", { now })).toBe(
      "12 Oct 2026",
    );
  });

  it("drops the year in the short form only within the current year", () => {
    expect(
      formatNewsDate("2026-10-03T08:00:00Z", "hu", { now, short: true }),
    ).toBe("okt. 03.");
    expect(
      formatNewsDate("2025-12-03T08:00:00Z", "hu", { now, short: true }),
    ).toBe("2025. dec. 03.");
  });
});

describe("isExternalUrl", () => {
  it("compares the origin", () => {
    const origin = "https://kampanykorut.hu";
    expect(isExternalUrl("https://kampanykorut.hu/menu", origin)).toBe(false);
    expect(isExternalUrl("/hirek/1", origin)).toBe(false);
    expect(isExternalUrl("https://github.com/x", origin)).toBe(true);
  });
});

describe("news API client", () => {
  const fetchMock = vi.fn<typeof fetch>();

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  const respond = (body: unknown, status = 200) => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));
    vi.stubGlobal("fetch", fetchMock);
  };

  it("requests the latest news with limit and language", async () => {
    respond({ items: [] });

    await fetchLatestNews({ limit: 4, lang: "en" });

    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      "/api/v1/news?limit=4&lang=en",
    );
  });

  it("passes archive filters and cursor", async () => {
    respond({ items: [], nextCursor: null });

    await fetchNewsArchive({
      lang: "hu",
      limit: 12,
      type: "kampany",
      cursor: "abc",
    });

    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      "/api/v1/news/archive?lang=hu&limit=12&type=kampany&cursor=abc",
    );
  });

  it("turns 404 into NewsNotFoundError and other failures into errors", async () => {
    respond({ status: 404 }, 404);
    await expect(fetchNewsDetail(5)).rejects.toBeInstanceOf(NewsNotFoundError);

    respond({ status: 500 }, 500);
    await expect(fetchNewsDetail(5)).rejects.toThrow(/500/);
  });
});
