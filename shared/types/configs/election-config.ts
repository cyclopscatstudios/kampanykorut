export interface ElectionConfig {
  title: string;
  listSeats: number;
  allSeats: number;
  thresholdPercent: number;
  districtBoost?: boolean;
  baseResults?: Record<string, number>;
  parties: RawParty[];
  playableSides: PlayableSide[];
  electionAssets: ElectionAsset[];
}

export type RawParty = {
  id: string;
  name: string;
  color: string;
};

export interface PlayableSide {
  id: string;
  label: string;
  description?: string;
  mainCandidates: Candidate[];
  playableCandidates?: string[];
}

export interface Candidate {
  id: string;
  label: string;
  description?: string;
}

export interface ElectionAsset {
  id: string;
  party_logo: string;
  candidateAssets: CandidateAsset[];
}

export interface CandidateAsset {
  id: string;
  portrait: string;
  slogan: string;
}
