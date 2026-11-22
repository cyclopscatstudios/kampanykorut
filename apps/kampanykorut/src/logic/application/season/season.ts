export const seasons = ["winter"] as const;

export type Season = (typeof seasons)[number];

export const SEASON_BACKGROUNDS: Record<Season, string> = {
  winter: "/backgrounds/winter_parliament.svg",
};

const WINTER_LAST_DAY_OF_JANUARY = 6;

export function getSeasonForDate(date: Date): Season | null {
  const month = date.getMonth();
  if (month === 11) {
    return "winter";
  }
  if (month === 0 && date.getDate() <= WINTER_LAST_DAY_OF_JANUARY) {
    return "winter";
  }
  return null;
}

export function resolveSeason(
  date: Date,
  override: string | undefined,
): Season | null {
  if (override === "none") {
    return null;
  }
  if (seasons.includes(override as Season)) {
    return override as Season;
  }
  return getSeasonForDate(date);
}

export function getCurrentSeason(): Season | null {
  return resolveSeason(new Date(), import.meta.env.VITE_SEASON);
}

export function getSeasonalBackground(
  background: string,
  defaultBackground: string,
  season: Season | null,
): string {
  if (!season || background !== defaultBackground) {
    return background;
  }
  return SEASON_BACKGROUNDS[season];
}
