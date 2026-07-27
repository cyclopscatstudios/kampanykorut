import { CandidateListData } from "../campaign";

export interface VoterEnvironmentConfig {
  eligibleVoters: number;
  maxTurnout: number;
  listData: CandidateListData[];
  turnoutHistory?: TurnoutHistory[];
}

export interface TurnoutHistory {
  year: string;
  turnoutPercentage: number;
  turnout?: number;
  eligibleVoters?: number;
}

export type Share = Record<string, number>;
