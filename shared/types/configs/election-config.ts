import { PartyListVotes } from "../campaign";

export type ElectionType = "parliamentary" | "mayoral";

export type ElectionResultRule = "plurality";

export interface ParliamentaryElectionDefinition {
  type: "parliamentary";
}

export interface MayoralElectionDefinition {
  type: "mayoral";
  resultRule?: ElectionResultRule;
}

export type ElectionDefinition =
  | ParliamentaryElectionDefinition
  | MayoralElectionDefinition;

interface ElectionConfigBase {
  title: string;
  year: string;
  districtBoost?: boolean;
  baseResults?: Record<string, Record<string, number>>;
  parties: RawParty[];
  playableSides: PlayableSide[];
  electionAssets: ElectionAsset[];
  districtMap: DistrictMapType;
}

export interface ParliamentaryElectionConfig extends ElectionConfigBase {
  election?: ParliamentaryElectionDefinition;
  listSeats: number;
  allSeats: number;
  thresholdPercent: number;
  partyListVotes: PartyListVotes;
}

export interface MayoralElectionConfig extends ElectionConfigBase {
  election: MayoralElectionDefinition;
  partyListVotes?: PartyListVotes;
}

export type ElectionConfig =
  | ParliamentaryElectionConfig
  | MayoralElectionConfig;

// "2011" / "2024": OEVK map by the year it was adopted; "budapest-districts": the 23 Budapest districts.
export type DistrictMapType = "2011" | "2024" | "budapest-districts";

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
