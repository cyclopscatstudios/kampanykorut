import { CampaignEngine } from "../domain/CampaignEngine";
import { EffectApplier } from "../domain/EffectApplier";
import { MandateCalculator } from "../domain/MandateCalculator";
import { ResultModifier } from "../domain/ResultModifier";
import { DistrictVoteTransformer } from "../domain/ResultTransformer/DistrictVoteTransformer";
import { UnionSwingTransformer } from "../domain/ResultTransformer/UnionSwingTransformer";
import { VoteShareTransformer } from "../domain/ResultTransformer/VoteShareTransformer";
import { VoterEnvironment } from "../VoterEnvironment";
import { GameConfigEngine } from "./ElectionConfigEngine";
import { StorageEngine } from "./StorageEngine";
import { StateHandler } from "./StateHandler";
import type { GameModeConfig } from "./types";
import { container } from "tsyringe";

export function createCampaignEngine(config: GameModeConfig) {
  const storageEngine = new StorageEngine();
  const electionConfigEngine = new GameConfigEngine(
    storageEngine,
    config.electionConfig,
  );
  const mandateCalculator = new MandateCalculator(electionConfigEngine);

  const effectApplier = new EffectApplier(
    electionConfigEngine,
    config.customGroups,
  );

  const voterEnvironment = new VoterEnvironment(config.voterEnvironmentConfig);

  const resultModifier = new ResultModifier(
    new UnionSwingTransformer(),
    new VoteShareTransformer(config.voterEnvironmentConfig),
    new DistrictVoteTransformer(voterEnvironment),
  );

  const stateHandler = container.resolve(StateHandler);

  return new CampaignEngine(
    config.candidateListData,
    config.partyListData,
    config.questions,
    config.answerEffect,
    resultModifier,
    effectApplier,
    mandateCalculator,
    electionConfigEngine,
    stateHandler,
    config.advisorFeedback,
  );
}
