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

// One fork of the focus tree: the player picks one of its focuses, and the
// choice is final. Branches open one after another in the listed order.
// Turns are counted from 1, the first question being turn 1.
export interface FocusBranch {
  id: string;
  title?: string;
  focuses: string[];
  // Only on this path: the branch is skipped unless this focus was chosen.
  requires?: string;
  availableFromTurn?: number;
  // Without a choice here this turn cannot be played: no district can be
  // visited until the player picks one of the branch's focuses.
  requiredBeforeTurn?: number;
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
  // Without branches every focus forms a single branch open from turn 1.
  focusBranches?: FocusBranch[];
  relationGroups?: RelationGroup[];
  relations?: Relation[];
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
  selectedFocusIds?: string[];
  // Turn of the latest choice; it can be changed until the turn is played.
  focusChosenAtTurn?: number;
  // Saves from before the focus tree had a single chosen focus.
  selectedFocusId?: string;
  relations?: Record<string, RelationStanding & { changedAtTurn: number }>;
  seenRelationIds?: string[];
  // Statuses of the chosen focuses when the dashboard was last opened.
  seenFocusStatus?: string;
}

export type FocusStatus =
  | "available"
  | "selected"
  | "completed"
  | "failed"
  | "excluded"
  | "upcoming";
