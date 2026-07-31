import {
  Asset,
  CampaignConfig,
  DistrictPoligon,
  VoterEnvironmentConfig,
} from "@/shared/types";

export const candidateListData = [
  {
    megyekod: 1,
    megye: "BP",
    oevk: 1,
    valasztopolgar: 600000,
    partok: {
      fidesz: 12000,
      ellenzek: 11000,
      mkkp: undefined,
    },
    telepules: "",
    jeloltek: {
      fidesz: ["Candidate A"],
      ellenzek: ["Candidate B"],
    },
  },
  {
    megyekod: 1,
    megye: "BP",
    oevk: 2,
    telepules: "",
    valasztopolgar: 600000,
    partok: {
      ellenzek: 9000,
      fidesz: 8000,
    },
  },
];

export const partyListData = [
  {
    megyekod: 1,
    megye: "BP",
    oevk: 1,
    telepules: "",
    partok: {
      fidesz: 50000,
      ellenzek: 40000,
      mkkp: 3000,
    },
  },
  {
    megyekod: 1,
    megye: "BP",
    oevk: 2,
    telepules: "",
    partok: {
      fidesz: 30000,
      ellenzek: 35000,
    },
  },
];

const voterEnvironmentConfig: VoterEnvironmentConfig = {
  maxTurnout: 85,
  eligibleVoters: 8215304,
  listData: candidateListData,
};
const electionConfig = {
  listSeats: 10,
  thresholdPercent: 5,
  parties: [],
};
const mockDistricts: DistrictPoligon[] = [
  { centrum: "", evk: "", maz: "", poligon: "" },
];
const mockEndResult = {
  playerSideDefeat: {} as Asset,
  playerSideVictory: {} as Asset,
};

export const mockGameConfig = {
  capitalCity: mockDistricts,
  districts: mockDistricts,
  electionConfig,
  voterEnvironmentConfig,
  candidateListData,
  partyListData,
  customGroups: [],
  playableSides: {
    mock_side: {
      mock_candidate: {
        questions: [],
        answerEffect: [],
        endResults: mockEndResult,
      },
    },
  },
} as unknown as CampaignConfig;
