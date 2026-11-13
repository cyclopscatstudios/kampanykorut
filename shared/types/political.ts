import { Condition } from "./condition";
import { IconName } from "./icon";

export type GameMode = "classic" | "strategic";

export const GAME_MODES: readonly GameMode[] = ["classic", "strategic"];

export interface PoliticalFocus {
  id: string;
  title: string;
  summary: string;
  description: string;
  icon?: IconName;
  completeWhen?: Condition;
  failWhen?: Condition;
}

export interface FocusBranch {
  id: string;
  title?: string;
  focuses: string[];
  requires?: string;
  availableFromTurn?: number;
  requiredBeforeTurn?: number;
}

export type RelationTone = "good" | "calm" | "tense" | "bad";

export const RELATION_TONES: readonly RelationTone[] = [
  "good",
  "calm",
  "tense",
  "bad",
];

export interface RelationStanding {
  tone: RelationTone;
  label: string;
  description: string;
}

export interface RelationGroup {
  id: string;
  title: string;
  icon?: IconName;
}

export interface Relation extends RelationStanding {
  id: string;
  name: string;
  groupId: string;
  icon?: IconName;
}

export interface PoliticalConfig {
  gameMode: GameMode;
  focuses?: PoliticalFocus[];
  focusBranches?: FocusBranch[];
  relationGroups?: RelationGroup[];
  relations?: Relation[];
  coalition?: CoalitionConfig;
  epilogues?: Epilogue[];
}

export interface CoalitionPartner {
  partyId: string;
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
  | "weak-coalition"
  | "failed"
  | "opposition";

export const GOVERNMENT_OUTCOMES: readonly GovernmentOutcome[] = [
  "single-majority",
  "coalition",
  "weak-coalition",
  "failed",
  "opposition",
];

export interface Epilogue {
  id: string;
  title: string;
  body: string;
  icon?: IconName;
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
  selectedFocusIds?: string[];
  focusChosenAtTurn?: number;
  selectedFocusId?: string;
  relations?: Record<string, RelationStanding & { changedAtTurn: number }>;
  seenRelationIds?: string[];
  seenFocusStatus?: string;
}

export type FocusStatus =
  | "available"
  | "selected"
  | "completed"
  | "failed"
  | "excluded"
  | "upcoming";
