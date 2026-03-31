export type PartyVotes = Record<PartyId, number>;

export interface CombinedOevk {
  megyekod: number;
  megye: string;
  oevk: number;
  constituencyVotes: PartyVotes;
  listVotes: PartyVotes;
  candidates?: Record<PartyId, string[]>;
}

export interface Candidates {
  id: string;
  label: string;
  description?: string;
}

export interface PlayableSide {
  id: string;
  name: string;
  description?: string;
  mainCandidates: Candidates[];
  playableCandidates?: string[];
}

export interface ElectionAsset {
  portrait: Record<string, string>;
  slogan: Record<string, string>;
  party_logo: string;
}

export interface ElectionConfig {
  listSeats: number;
  thresholdPercent: number;
  districtBoost?: boolean;
  playerSide?: string;
  baseResults?: Record<string, number>;
  parties: RawParty[];
  playableSides: PlayableSide[];
  electionAssets: Record<string, ElectionAsset>;
}

export type PartyId = string;

export type PartyVotesRaw = Record<PartyId, number | undefined>;

export type CandidateMapRaw = Record<PartyId, string[] | undefined>;
export type CandidateMap = Record<PartyId, string[]>;

export interface CalculateResults {
  totals: PartyVotes;
  mandates: Array<{
    party: string;
    constituencySeats: number;
    listSeats: number;
    totalSeats: number;
  }>;
  constituencySeats: Record<string, number>;
  listSeats: Record<string, number>;
  compensation: {
    losingVotes: PartyVotes;
    winnerCompensation: PartyVotes;
    total: PartyVotes;
  };
  percentages: Record<string, number>;
}

export type RawParty = {
  id: string;
  name: string;
  color: string;
};
