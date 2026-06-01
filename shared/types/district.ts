import { CandidateListData } from "./campaign";

export interface DistrictGroup {
  id: string;
  label: string;
  districts: Pick<CandidateListData, "megyekod" | "oevk">[];
}

export type District = {
  winner: string;
  maxVotes?: number;
} & CandidateListData;

export interface DistrictTarget {
  megyekod: number;
  oevk: number;
  targetParty: string;
  amount: number;
  from?: VoteSource;
}

export type VoteSource =
  | { type: "bizonytalan" }
  | { type: "party"; party: string };

export interface DistrictTargetGroup {
  groupId: string;
  isCustomGroup?: boolean;
  targetParty: string;
  amount: number;
  from?: VoteSource;
}
