import type { District } from "../../../components/ui/map.utils";
import {
  candidateListData,
  partyListData,
} from "../../domain/mocks/mockListData";
import type { VoterEnvironmentConfig } from "../../VoterEnvironment";
import type { GameModeConfig } from "./useElectionState";

const voterEnvironmentConfig: VoterEnvironmentConfig = {
  maxTurnout: 85,
  eligibleVoters: 8215304,
  listData: candidateListData,
};
const electionConfig = {
  listSeats: 10,
  thresholdPercent: 5,
};
const mockDistricts: District[] = [
  { centrum: "", evk: "", maz: "", poligon: "" },
];

export const mockGameConfig = {
  answerEffect: [],
  questions: [],
  capitalCity: mockDistricts,
  districts: mockDistricts,
  electionConfig,
  voterEnvironmentConfig,
  candidateListData,
  partyListData,
} as GameModeConfig;
