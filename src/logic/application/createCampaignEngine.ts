import { CampaignEngine } from "../domain/CampaignEngine";
import { EffectApplier } from "../domain/EffectApplier";
import { MandateCalculator } from "../domain/MandateCalculator";
import { ResultModifier } from "../domain/ResultModifier";
import { DistrictTargetTransform } from "../domain/ResultTransformer/DistrictTargetTransform";
import { NationalSwingTransform } from "../domain/ResultTransformer/NationalSwingTransform";
import { PipelineTransform } from "../domain/ResultTransformer/PipelineTransform";
import { VoterEnvironment } from "../VoterEnvironment";
import type { GameModeConfig } from "./hooks/useElectionState";

export function createCampaignEngine(config: GameModeConfig) {
  const mandateCalculator = new MandateCalculator(config.electionConfig);

  const effectApplier = new EffectApplier(config.electionConfig);

  const voterEnvironment = new VoterEnvironment(config.voterEnvironmentConfig);

  const resultModifier = new ResultModifier(
    new NationalSwingTransform(),
    new PipelineTransform(config.voterEnvironmentConfig, config.electionConfig),
    new DistrictTargetTransform(voterEnvironment),
  );

  return new CampaignEngine(
    config.candidateListData,
    config.partyListData,
    config.questions,
    config.answerEffect,
    resultModifier,
    effectApplier,
    mandateCalculator,
  );
}
