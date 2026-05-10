import {
  CampaignEngine,
  EffectApplier,
  MandateCalculator,
  ResultModifier,
} from "@/logic/domain";
import { VoterEnvironment } from "../domain/VoterEnvironment";
import { ConfigEngine } from "./ConfigEngine";
import type { CampaignConfig } from "../types/campaignEngine.types";
import { container } from "tsyringe";
import { DistrictGroupEngine } from "../domain/DistrictGroupEngine";

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
