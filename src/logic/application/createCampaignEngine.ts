import {
  CampaignEngine,
  EffectApplier,
  MandateCalculator,
  ResultModifier,
} from "@/logic/domain";
import { VoterEnvironment } from "../VoterEnvironment";
import { GameConfigEngine } from "./GameConfigEngine";
import type { GameModeConfig } from "../types/campaignEngine.types";
import { container } from "tsyringe";

export function createCampaignEngine(config: GameModeConfig) {
  const configEngine = container.resolve(GameConfigEngine);
  configEngine.configure(config.electionConfig);

  const voterEnvironment = container.resolve(VoterEnvironment);
  voterEnvironment.configure(config.voterEnvironmentConfig);

  const effectApplier = container.resolve(EffectApplier);
  effectApplier.configure(config.customGroups);

  const campaignEngine = new CampaignEngine(
    config.candidateListData,
    config.partyListData,
    config.questions,
    config.answerEffect,
    container.resolve(ResultModifier),
    effectApplier,
    container.resolve(MandateCalculator),
    config.advisorFeedback,
  );

  return { campaignEngine, configEngine };
}
