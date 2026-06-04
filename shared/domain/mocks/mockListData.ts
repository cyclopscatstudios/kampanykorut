import { CandidateListData, PartyListData } from "../../types/campaign";

export const mockCandidateListData: CandidateListData[] = [
  {
    megyekod: 1,
    megye: "BP",
    oevk: 1,
    valasztopolgar: 600000,
    partok: {
      party_a: 12000,
      party_b: 11000,
      party_c: undefined,
    },
    telepules: "",
    jeloltek: {
      party_a: ["Candidate A"],
      party_b: ["Candidate B"],
    },
  },
  {
    megyekod: 1,
    megye: "BP",
    oevk: 2,
    telepules: "",
    valasztopolgar: 600000,
    partok: {
      party_a: 9000,
      party_b: 8000,
    },
  },
];

export const mockPartyListData: PartyListData[] = [
  {
    megyekod: 1,
    megye: "BP",
    oevk: 1,
    partok: {
      party_a: 50000,
      party_b: 40000,
      party_c: 3000,
    },
  },
  {
    megyekod: 1,
    megye: "BP",
    oevk: 2,
    partok: {
      party_a: 30000,
      party_b: 35000,
    },
  },
];
