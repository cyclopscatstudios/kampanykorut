import { CampaignConfig } from "@/shared/types";
import customPollsters from "./custom_pollsters.json";
import electionConfig from "./election_config.json";
import endResults from "./end_results.json";
import districts from "./oevk_2024.json";
import candidateListData from "./oevk_constituency_results.json";
import voterEnvironmentRaw from "./voter_environment_config.json";

export const config2026: CampaignConfig = {
  electionConfig,
  voterEnvironmentConfig: {
    ...voterEnvironmentRaw,
    listData: candidateListData,
  },
  candidateListData,
  districts,
  questions: [],
  answerEffect: [],
  endResults,
  customPollsters,
};
