import { container } from "tsyringe";
import { CampaignEngine } from "../domain/CampaignEngine";
import { EffectApplier } from "../domain/EffectApplier";
import { MandateCalculator } from "../domain/MandateCalculator";
import { ResultModifier } from "../domain/ResultModifier";
import { DistrictVoteTransformer } from "../domain/ResultTransformer/DistrictVoteTransformer";
import { UnionSwingTransformer } from "../domain/ResultTransformer/UnionSwingTransformer";
import { VoteShareTransformer } from "../domain/ResultTransformer/VoteShareTransformer";
import { VoterEnvironment } from "../VoterEnvironment";
import type { GameModeConfig } from "./hooks/useElectionState";
import { StateHandler } from "./StateHandler";

export function createCampaignEngine(config: GameModeConfig) {
  const mandateCalculator = new MandateCalculator(config.electionConfig);
  const stateHandler = container.resolve(StateHandler);

  const effectApplier = new EffectApplier(config.electionConfig, stateHandler);

  const voterEnvironment = new VoterEnvironment(config.voterEnvironmentConfig);

  const resultModifier = new ResultModifier(
    new UnionSwingTransformer(),
    new VoteShareTransformer(
      config.voterEnvironmentConfig,
      config.electionConfig,
    ),
    new DistrictVoteTransformer(voterEnvironment),
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
