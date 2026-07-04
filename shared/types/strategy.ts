import { RawEffect } from "./effects";

export interface Strategy {
  id: string;
  label: string;
  conditions: StrategyAnswerCondition[];
  rewards: StrategyReward[];
}

export interface StrategyReward {
  minMatches: number;
  effects: RawEffect[];
}

export interface StrategyAnswerCondition {
  questionId: string;
  answerId: string;
}
