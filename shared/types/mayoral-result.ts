export type MayoralOutcome =
  | { kind: "winner"; candidateId: string }
  | { kind: "tie"; candidateIds: string[] }
  | { kind: "no_winner" };

export interface MayoralStanding {
  candidateId: string;
  votes: number;
  share: number;
}

export interface MayoralMargin {
  votes: number;
  percentagePoints: number;
}

export interface MayoralTally {
  validVotes: number;
  votes: Record<string, number>;
  percentages: Record<string, number>;
  standings: MayoralStanding[];
  withdrawn: { candidateId: string; votes: number }[];
  outcome: MayoralOutcome;
  margin?: MayoralMargin;
}

export interface MayoralDistrictResult extends MayoralTally {
  megyekod: number;
  oevk: number;
  label: string;
  eligibleVoters: number;
}

export interface MayoralResult extends MayoralTally {
  eligibleVoters: number;
  districts: MayoralDistrictResult[];
}
