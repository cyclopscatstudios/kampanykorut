import { CandidateStatus } from "./campaign";

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

export type EventTriggeredCondition = {
  type: "event-triggered";
  eventId: string;
};

export type LeafCondition =
  | TurnCondition
  | CandidateSupportCondition
  | AnswerSelectedCondition
  | CandidateStatusCondition
  | EventTriggeredCondition;

export type Condition =
  | AndCondition
  | OrCondition
  | NotCondition
  | LeafCondition;

export interface ConditionContext {
  turn: number;
  answers: { questionId: string; answerId: string }[];
  getSupport(candidateId: string): number | undefined;
  getCandidateStatus(candidateId: string): CandidateStatus;
  triggeredEventIds: string[];
}
