import {
  CampaignEngine,
  DistrictVoteTransformer,
  EffectApplier,
  MandateCalculator,
  ResultModifier,
  UnionSwingTransformer,
  VoteShareTransformer,
} from "@/logic/domain";
import { VoterEnvironment } from "../VoterEnvironment";
import { GameConfigEngine } from "./GameConfigEngine";
import { StorageEngine } from "./StorageEngine";
import type { GameModeConfig } from "./types";

export function createCampaignEngine(config: GameModeConfig) {
  const configEngine = new GameConfigEngine(
    new StorageEngine(),
    config.electionConfig,
  );

  const voterEnvironment = new VoterEnvironment(config.voterEnvironmentConfig);

  const campaignEngine = new CampaignEngine(
    config.candidateListData,
    config.partyListData,
    config.questions,
    config.answerEffect,
    new ResultModifier(
      new UnionSwingTransformer(),
      new VoteShareTransformer(config.voterEnvironmentConfig),
      new DistrictVoteTransformer(voterEnvironment),
    ),
    new EffectApplier(configEngine, config.customGroups),
    new MandateCalculator(configEngine),
    configEngine,
    config.advisorFeedback,
  );

  return { campaignEngine, configEngine };
}
