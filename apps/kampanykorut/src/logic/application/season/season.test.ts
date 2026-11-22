import {
  getSeasonalBackground,
  getSeasonForDate,
  resolveSeason,
  SEASON_BACKGROUNDS,
} from "./season";

describe("getSeasonForDate", () => {
  it("is winter from the first day of December", () => {
    expect(getSeasonForDate(new Date(2026, 11, 1))).toBe("winter");
  });

  it("is winter on New Year's Eve", () => {
    expect(getSeasonForDate(new Date(2026, 11, 31, 23, 59))).toBe("winter");
  });

  it("is winter until Epiphany", () => {
    expect(getSeasonForDate(new Date(2027, 0, 6, 23, 59))).toBe("winter");
  });

  it("has no season the day after Epiphany", () => {
    expect(getSeasonForDate(new Date(2027, 0, 7))).toBeNull();
  });

  it("has no season at the end of November", () => {
    expect(getSeasonForDate(new Date(2026, 10, 30, 23, 59))).toBeNull();
  });

  it("has no season in summer", () => {
    expect(getSeasonForDate(new Date(2026, 6, 15))).toBeNull();
  });
});

describe("resolveSeason", () => {
  const summer = new Date(2026, 6, 15);
  const december = new Date(2026, 11, 10);

  it("follows the calendar without an override", () => {
    expect(resolveSeason(december, undefined)).toBe("winter");
    expect(resolveSeason(summer, undefined)).toBeNull();
  });

  it("forces a known season", () => {
    expect(resolveSeason(summer, "winter")).toBe("winter");
  });

  it("turns seasons off with none", () => {
    expect(resolveSeason(december, "none")).toBeNull();
  });

  it("ignores an unknown override", () => {
    expect(resolveSeason(summer, "spring")).toBeNull();
    expect(resolveSeason(december, "spring")).toBe("winter");
  });
});

describe("getSeasonalBackground", () => {
  const fallback = "/parlament_night.jpg";

  it("swaps the default background in season", () => {
    expect(getSeasonalBackground(fallback, fallback, "winter")).toBe(
      SEASON_BACKGROUNDS.winter,
    );
  });

  it("keeps a campaign's own background in season", () => {
    expect(
      getSeasonalBackground("/images/1957/bg.webp", fallback, "winter"),
    ).toBe("/images/1957/bg.webp");
  });

  it("keeps the default background out of season", () => {
    expect(getSeasonalBackground(fallback, fallback, null)).toBe(fallback);
  });
});
