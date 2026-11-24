import { useEffect } from "react";
import { getCurrentSeason, type Season } from "../season/season";
import { useSettings } from "./useSettings";

export function useSeason(): Season | null {
  const { settings } = useSettings();
  const season = settings.seasonalTheme === false ? null : getCurrentSeason();

  useEffect(() => {
    const root = document.documentElement;
    if (season) {
      root.dataset.season = season;
    } else {
      delete root.dataset.season;
    }
  }, [season]);

  return season;
}
