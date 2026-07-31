export type PartyVotes = Record<PartyId, number>;

export interface CombinedOevk {
  megyekod: number;
  megye: string;
  oevk: number;
  constituencyVotes: PartyVotes;
  listVotes: PartyVotes;
  candidates?: Record<PartyId, string[]>;
}

export type PartyId = string;

export type PartyVotesRaw = Record<PartyId, number | undefined>;

export type CandidateMapRaw = Record<PartyId, string[] | undefined>;
export type CandidateMap = Record<PartyId, string[]>;

export type Mandate = {
  party: string;
  constituencySeats: number;
  listSeats: number;
  totalSeats: number;
};
