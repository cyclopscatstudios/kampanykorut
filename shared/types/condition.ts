import { CandidateStatus } from "./campaign";
import type { RelationTone } from "./political";

export type ComparisonOperator = "<" | "<=" | ">" | ">=";

export type AndCondition = { and: Condition[] };

export type OrCondition = { or: Condition[] };

export type NotCondition = { not: Condition };

export type TurnCondition = { type: "turn"; min?: number; max?: number };

export type CandidateSupportCondition = {
  type: "candidate-support";
  candidateId: string;
  operator: ComparisonOperator;
  value: number;
};

export type CandidateRankCondition = {
  type: "candidate-rank";
  candidateId: string;
  min?: number;
  max?: number;
  minGapBehind?: number;
  maxGapBehind?: number;
};

export type AnswerSelectedCondition = {
  type: "answer-selected";
  questionId: string;
  answerId: string;
};

export type CandidateStatusCondition = {
  type: "candidate-status";
  candidateId: string;
  status: CandidateStatus;
};

export type PlayerCandidateCondition = {
  type: "player-candidate";
  candidateId: string;
};

export type EventTriggeredCondition = {
  type: "event-triggered";
  eventId: string;
};

export type FocusSelectedCondition = {
  type: "focus-selected";
  focusId: string;
};

export type RelationCondition = {
  type: "relation";
  relationId: string;
  tone: RelationTone[];
};

export type IssuePositionCondition = {
  type: "issue-position";
  issueId: string;
  party?: string;
  min?: number;
  max?: number;
};

export type LeafCondition =
  | TurnCondition
  | CandidateSupportCondition
  | CandidateRankCondition
  | AnswerSelectedCondition
  | CandidateStatusCondition
  | PlayerCandidateCondition
  | EventTriggeredCondition
  | FocusSelectedCondition
  | RelationCondition
  | IssuePositionCondition;

export type Condition =
  | AndCondition
  | OrCondition
  | NotCondition
  | LeafCondition;

export interface ConditionContext {
  turn: number;
  answers: { questionId: string; answerId: string }[];
  getSupport(candidateId: string): number | undefined;
  getStandings(): { candidateId: string; share: number }[] | undefined;
  getCandidateStatus(candidateId: string): CandidateStatus;
  playerCandidateId?: string;
  triggeredEventIds: string[];
  selectedFocusIds?: string[];
  getRelationTone?(relationId: string): RelationTone | undefined;
  getIssuePosition?(issueId: string, party?: string): number | undefined;
}
