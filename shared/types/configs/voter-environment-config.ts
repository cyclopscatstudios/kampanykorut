import { CandidateListData } from "../campaign";

export interface VoterEnvironmentConfig {
  eligibleVoters: number;
  maxTurnout: number;
  listData: CandidateListData[];
}

export type Share = Record<string, number>;
