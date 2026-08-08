export const DATA_PATHS = {
  campaigns: "/assets/jsons/game_modes.json",
  quotes: "/assets/jsons/quotes.json",
  electionConfig: (route: string) => `/campaigns/${route}/election_config.json`,
  districtMap: (map: string) => `/assets/jsons/shared/${map}.json`,
  background: "/parlament_night.jpg",
} as const;

export function getDataPath(
  key: keyof typeof DATA_PATHS,
  route?: string,
): string {
  const value = DATA_PATHS[key];

  if (typeof value === "function") {
    if (!route) {
      throw new Error(`Route is required for key: ${key}`);
    }
    return value(route);
  }

  return value;
}
