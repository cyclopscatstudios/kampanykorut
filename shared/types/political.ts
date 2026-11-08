import { Condition } from "./condition";
import { BootstrapIcon } from "./icon";

export type GameMode = "classic" | "strategic";

export const GAME_MODES: readonly GameMode[] = ["classic", "strategic"];

export interface PoliticalFocus {
  id: string;
  title: string;
  summary: string;
  description: string;
  icon?: BootstrapIcon;
  completeWhen?: Condition;
  failWhen?: Condition;
}

export interface PoliticalConfig {
  gameMode: GameMode;
  focuses?: PoliticalFocus[];
  // Once this event has triggered, the chosen focus can no longer be changed.
  focusLockEventId?: string;
}

export interface PoliticalDashboardState {
  seenEventIds: string[];
  selectedFocusId?: string;
}

export type FocusStatus =
  | "available"
  | "selected"
  | "completed"
  | "failed"
  | "excluded";
