import { CampaignEngine } from "../domain/CampaignEngine";
import { EffectApplier } from "../domain/EffectApplier";
import { MandateCalculator } from "../domain/MandateCalculator";
import { ResultModifier } from "../domain/ResultModifier";
import { DistrictTargetTransform } from "../domain/ResultTransformer/DistrictTargetTransform";
import { NationalSwingTransform } from "../domain/ResultTransformer/NationalSwingTransform";
import { PipelineTransform } from "../domain/ResultTransformer/PipelineTransform";
import { VoterEnvironment } from "../VoterEnvironment";
import { StateEngine } from "./StateEngine";
import type { GameModeConfig } from "./hooks/useElectionState";
import { StorageEngine } from "./StorageEngine";

export function createCampaignEngine(config: GameModeConfig) {
  const mandateCalculator = new MandateCalculator(config.electionConfig);

  const effectApplier = new EffectApplier(config.electionConfig);

  const voterEnvironment = new VoterEnvironment(config.voterEnvironmentConfig);

  const resultModifier = new ResultModifier(
    new NationalSwingTransform(),
    new PipelineTransform(config.voterEnvironmentConfig, config.electionConfig),
    new DistrictTargetTransform(voterEnvironment),
  );

  const gameSessionEngine = new StateEngine(new StorageEngine());

  return new CampaignEngine(
    config.candidateListData,
    config.partyListData,
    config.questions,
    config.answerEffect,
    resultModifier,
    effectApplier,
    mandateCalculator,
    gameSessionEngine,
  );
}
