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
  // Focus ids that can no longer be chosen once this one is selected.
  excludes?: string[];
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
  // No district can be visited until the player has chosen a focus.
  requireFocus?: boolean;
  coalition?: CoalitionConfig;
  epilogues?: Epilogue[];
}

export interface CoalitionPartner {
  partyId: string;
  // Without a condition the party always accepts the offer.
  acceptWhen?: Condition;
  acceptReason: string;
  rejectReason: string;
}

export interface CoalitionConfig {
  partners: CoalitionPartner[];
}

export type GovernmentOutcome =
  | "single-majority"
  | "coalition"
  | "failed"
  | "opposition";

export const GOVERNMENT_OUTCOMES: readonly GovernmentOutcome[] = [
  "single-majority",
  "coalition",
  "failed",
  "opposition",
];

export interface Epilogue {
  id: string;
  title: string;
  body: string;
  icon?: BootstrapIcon;
  // The first epilogue whose outcomes and condition both match is shown.
  outcomes?: GovernmentOutcome[];
  when?: Condition;
}

export interface CoalitionResponse {
  partyId: string;
  accepted: boolean;
}

export interface CoalitionState {
  responses: CoalitionResponse[];
}

export interface PoliticalDashboardState {
  seenEventIds: string[];
  selectedFocusId?: string;
  relations?: Record<string, RelationStanding & { changedAtTurn: number }>;
  seenRelationIds?: string[];
  // "focusId:status" of the chosen focus when the dashboard was last opened.
  seenFocusStatus?: string;
}

export type FocusStatus =
  | "available"
  | "selected"
  | "completed"
  | "failed"
  | "excluded";
