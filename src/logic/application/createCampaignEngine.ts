import { CampaignEngine } from "../domain/CampaignEngine";
import { EffectApplier } from "../domain/EffectApplier";
import { MandateCalculator } from "../domain/MandateCalculator";
import { ResultModifier } from "../domain/ResultModifier";
import { DistrictVoteTransformer } from "../domain/ResultTransformer/DistrictVoteTransformer";
import { UnionSwingTransformer } from "../domain/ResultTransformer/UnionSwingTransformer";
import { VoteShareTransformer } from "../domain/ResultTransformer/VoteShareTransformer";
import { VoterEnvironment } from "../VoterEnvironment";
import type { GameModeConfig } from "./hooks/useElectionState";
import { ElectionConfigEngine } from "../domain/ElectionConfigEngine";
import { StorageEngine } from "./StorageEngine";
import { StateHandler } from "./StateHandler";

export function createCampaignEngine(config: GameModeConfig) {
  const storageEngine = new StorageEngine();
  const electionConfigEngine = new ElectionConfigEngine(
    storageEngine,
    config.electionConfig,
  );
  const mandateCalculator = new MandateCalculator(electionConfigEngine);

  const effectApplier = new EffectApplier(electionConfigEngine);

  const voterEnvironment = new VoterEnvironment(config.voterEnvironmentConfig);

  const resultModifier = new ResultModifier(
    new UnionSwingTransformer(),
    new VoteShareTransformer(config.voterEnvironmentConfig),
    new DistrictVoteTransformer(voterEnvironment),
  );

  return new CampaignEngine(
    config.candidateListData,
    config.partyListData,
    config.questions,
    config.answerEffect,
    config.advisorFeedback,
    resultModifier,
    effectApplier,
    mandateCalculator,
    electionConfigEngine,
    new StateHandler(),
  );
}
