import { PartyListVotes } from "../campaign";

export type ElectionType = "parliamentary" | "mayoral" | "proportional";

export type ElectionResultRule = "plurality";

export interface ParliamentaryElectionDefinition {
  type: "parliamentary";
}

// One multi-member region of a proportional election. Its votes are the sum of
// the candidate list rows of the listed counties (megyekod).
export interface ProportionalRegion {
  id: string;
  name: string;
  seats: number;
  megyekods: number[];
}

// Regional seats go by D'Hondt per region; the national `listSeats` go by
// D'Hondt over the votes each party did not turn into a regional seat.
export interface ProportionalElectionDefinition {
  type: "proportional";
  regions: ProportionalRegion[];
}

export interface MayoralElectionDefinition {
  type: "mayoral";
  resultRule?: ElectionResultRule;
}

export type ElectionDefinition =
  | ParliamentaryElectionDefinition
  | ProportionalElectionDefinition
  | MayoralElectionDefinition;

export interface CampaignIntro {
  title?: string;
  subtitle?: string;
  text: string;
}

interface ElectionConfigBase {
  title: string;
  year: string;
  intro?: CampaignIntro;
  districtBoost?: boolean;
  baseResults?: Record<string, Record<string, number>>;
  parties: RawParty[];
  playableSides: PlayableSide[];
  electionAssets: ElectionAsset[];
  districtMap: DistrictMapType;
}

export interface ParliamentaryElectionConfig extends ElectionConfigBase {
  election?: ParliamentaryElectionDefinition | ProportionalElectionDefinition;
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
  // Hidden and voteless until a split-party event brings it into the race.
  dormant?: boolean;
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
