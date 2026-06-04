import { container } from "tsyringe";
import { ConfigEngine } from "./ConfigEngine";
import {
  CampaignEngine,
  DistrictGroupEngine,
  EffectApplier,
  MandateCalculator,
  PollsterEngine,
  ResultModifier,
  VoterEnvironment,
} from "@/shared/domain";
import { CampaignConfig } from "@/shared/types";

export function createCampaignEngine(
  config: CampaignConfig,
  campaignId: string,
) {
  const configEngine = container.resolve(ConfigEngine);
  configEngine.configure(config, campaignId);

  const voterEnvironment = container.resolve(VoterEnvironment);
  voterEnvironment.configure(config.voterEnvironmentConfig);

  const districtGroupEngine = container.resolve(DistrictGroupEngine);
  districtGroupEngine.configure(config.candidateListData, config.customGroups);

  const pollsterEngine = container.resolve(PollsterEngine);
  pollsterEngine.configure(config.customPollsters);

  const campaignEngine = new CampaignEngine(
    config.candidateListData,
    config.partyListData,
    config.questions,
    config.answerEffect,
    container.resolve(ResultModifier),
    container.resolve(EffectApplier),
    container.resolve(MandateCalculator),
    config.advisorFeedback,
  );

  return { campaignEngine, configEngine };
}
