import { RawEffect } from "./effects";

export interface Strategy {
  id: string;
  label: string;
  target: Target;
  conditions: StrategyAnswerCondition[];
  rewards: StrategyReward[];
  asset?: {
    badge?: string;
  };
}

export interface Target {
  party: string;
  candidate: string;
}

export interface StrategyReward {
  minMatches: number;
  effects: RawEffect[];
}

export interface StrategyAnswerCondition {
  questionId: string;
  answerId: string;
}
