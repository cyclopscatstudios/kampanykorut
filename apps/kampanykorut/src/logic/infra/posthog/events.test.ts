import { describe, expect, it } from "vitest";
import { getEntryPage, getEntryProperties, getReferringDomain } from "./events";

describe("getEntryPage", () => {
  it.each([
    ["/", "landing"],
    ["/kampany/2026_tavaszi-szel", "campaign_page"],
    ["/news/3", "news"],
    ["/menu", "menu"],
    ["/new-game/classic", "menu"],
    ["/game/2026", "game"],
    ["/privacy", "other"],
  ] as const)("%s is a %s entry", (path, page) => {
    expect(getEntryPage(path)).toBe(page);
  });
});

describe("getReferringDomain", () => {
  it("marks a missing referrer as direct", () => {
    expect(getReferringDomain("", "kampanykorut.hu")).toBe("$direct");
  });

  it("strips www from external hosts", () => {
    expect(
      getReferringDomain("https://www.facebook.com/x", "kampanykorut.hu"),
    ).toBe("facebook.com");
  });

  it("marks the own site as internal", () => {
    expect(
      getReferringDomain("https://kampanykorut.hu/menu", "www.kampanykorut.hu"),
    ).toBe("$internal");
  });
});

describe("getEntryProperties", () => {
  it("reads utm parameters from the entry url", () => {
    expect(
      getEntryProperties(
        {
          pathname: "/kampany/1957",
          search: "?utm_source=result_card&utm_medium=share&utm_campaign=1957",
          hostname: "kampanykorut.hu",
        },
        "https://l.facebook.com/",
      ),
    ).toEqual({
      entry_page: "campaign_page",
      entry_referring_domain: "l.facebook.com",
      entry_utm_source: "result_card",
      entry_utm_medium: "share",
      entry_utm_campaign: "1957",
    });
  });

  it("leaves utm fields empty without parameters", () => {
    expect(
      getEntryProperties(
        { pathname: "/", search: "", hostname: "kampanykorut.hu" },
        "",
      ),
    ).toEqual({
      entry_page: "landing",
      entry_referring_domain: "$direct",
      entry_utm_source: undefined,
      entry_utm_medium: undefined,
      entry_utm_campaign: undefined,
    });
  });
});
