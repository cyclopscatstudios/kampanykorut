export type Shares = Record<string, number>;

export interface CandidateListData {
  megyekod: number;
  megye: string;
  oevk: number;
  telepules: string;
  valasztopolgar: number;
  partok: Record<string, number | undefined>;
  jeloltek?: Record<string, string[] | undefined>;
}

export interface PartyListData {
  megyekod: number;
  megye: string;
  oevk: number;
  partok: Record<string, number | undefined>;
}

export type VoteSource =
  | { type: "bizonytalan" }
  | { type: "party"; party: string };

export interface DistrictTarget {
  megyekod: number;
  oevk: number;
  targetParty: string;
  amount: number;
  from?: VoteSource;
}

export interface DistributedVotesResult {
  districts: CandidateListData[];
  totals: Record<string, number>;
  percentages: Shares;
  totalVotes: number;
}
