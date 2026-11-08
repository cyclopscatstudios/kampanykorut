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

export type RelationTone = "good" | "calm" | "tense" | "bad";

export const RELATION_TONES: readonly RelationTone[] = [
  "good",
  "calm",
  "tense",
  "bad",
];

// The qualitative standing of a relation: a tone plus a one-word label and a
// longer explanation shown on hover. No numbers are ever exposed.
export interface RelationStanding {
  tone: RelationTone;
  label: string;
  description: string;
}

export interface RelationGroup {
  id: string;
  title: string;
  icon?: BootstrapIcon;
}

export interface Relation extends RelationStanding {
  id: string;
  name: string;
  groupId: string;
  icon?: BootstrapIcon;
}

export interface PoliticalConfig {
  gameMode: GameMode;
  focuses?: PoliticalFocus[];
  relationGroups?: RelationGroup[];
  relations?: Relation[];
  // Once this event has triggered, the chosen focus can no longer be changed.
  focusLockEventId?: string;
}

export interface PoliticalDashboardState {
  seenEventIds: string[];
  selectedFocusId?: string;
  relations?: Record<string, RelationStanding & { changedAtTurn: number }>;
  seenRelationIds?: string[];
}

export type FocusStatus =
  | "available"
  | "selected"
  | "completed"
  | "failed"
  | "excluded";
