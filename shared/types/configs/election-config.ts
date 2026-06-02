export interface ElectionConfig {
  title: string;
  listSeats: number;
  allSeats: number;
  thresholdPercent: number;
  districtBoost?: boolean;
  baseResults?: Record<string, number>;
  parties: RawParty[];
  playableSides: PlayableSide[];
  electionAssets: Record<string, ElectionAsset>;
}

export type RawParty = {
  id: string;
  name: string;
  color: string;
};

export interface PlayableSide {
  id: string;
  name: string;
  description?: string;
  mainCandidates: Candidates[];
  playableCandidates?: string[];
}

export interface Candidates {
  id: string;
  label: string;
  description?: string;
}

export interface ElectionAsset {
  portrait: Record<string, string>;
  slogan: Record<string, string>;
  party_logo: string;
}
