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

export const mockGameConfig = {
  electionConfig,
  voterEnvironmentConfig,
  candidateListData,
  partyListData,
} as GameModeConfig;
