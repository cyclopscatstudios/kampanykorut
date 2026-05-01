import {
  CampaignEngine,
  EffectApplier,
  MandateCalculator,
  ResultModifier,
} from "@/logic/domain";
import { VoterEnvironment } from "../domain/VoterEnvironment";
import { GameConfigEngine } from "./GameConfigEngine";
import type { CampaignConfig } from "../types/campaignEngine.types";
import { container } from "tsyringe";
import { DistrictGroupEngine } from "../domain/DistrictGroupEngine";

export function createCampaignEngine(config: CampaignConfig) {
  const configEngine = container.resolve(GameConfigEngine);
  configEngine.configure(config.electionConfig);

  const voterEnvironment = container.resolve(VoterEnvironment);
  voterEnvironment.configure(config.voterEnvironmentConfig);

  const districtGroupEngine = container.resolve(DistrictGroupEngine);
  districtGroupEngine.configure(config.customGroups);

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
