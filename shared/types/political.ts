export type GameMode = "classic" | "strategic";

export const GAME_MODES: readonly GameMode[] = ["classic", "strategic"];

export interface PoliticalConfig {
  gameMode: GameMode;
}

export interface PoliticalDashboardState {
  seenEventIds: string[];
}
