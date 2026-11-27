import type { GameSettings } from "@shared/types";

export const MAP_VIEWS = ["classic", "detailed"] as const;

export type MapView = (typeof MAP_VIEWS)[number];

export function getMapView(settings: GameSettings): MapView {
  return settings.mapView ?? "detailed";
}
