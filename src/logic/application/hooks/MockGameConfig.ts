import type { DistrictPoligon } from "../../../components/ui/map.utils";
import {
  candidateListData,
  partyListData,
} from "../../domain/mocks/mockListData";
import type {
  EndResultProps,
  Asset,
  CampaignConfig,
} from "../../types/campaignEngine.types";
import type { VoterEnvironmentConfig } from "../../domain/VoterEnvironment";

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
const mockEndResult: EndResultProps = {
  playerSideDefeat: {} as Asset,
  playerSideVictory: {} as Asset,
};

export const mockGameConfig = {
  answerEffect: [],
  questions: [],
  capitalCity: mockDistricts,
  districts: mockDistricts,
  electionConfig,
  voterEnvironmentConfig,
  candidateListData,
  partyListData,
  endResults: mockEndResult,
  customGroups: [],
} as unknown as CampaignConfig;
