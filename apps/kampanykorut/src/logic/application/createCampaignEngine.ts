import { container } from "tsyringe";
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
import { ConfigEngine } from "./ConfigEngine";

export function createCampaignEngine(
  config: CampaignConfig,
  campaignId: string,
  playerSideId?: string,
  playerCandidateId?: string,
) {
  const configEngine = container.resolve(ConfigEngine);
  configEngine.configure(config, campaignId);

  const voterEnvironment = container.resolve(VoterEnvironment);
  voterEnvironment.configure(config.voterEnvironmentConfig);

  const districtGroupEngine = container.resolve(DistrictGroupEngine);
  districtGroupEngine.configure(config.candidateListData, config.customGroups);

  const pollsterEngine = container.resolve(PollsterEngine);
  pollsterEngine.configure(config.customPollsters);

  const partyIds = Object.keys(config.playableSides ?? {});
  const resolvedPartyId =
    playerSideId ?? (partyIds.length === 1 ? partyIds[0] : undefined);
  const partySide = resolvedPartyId
    ? config.playableSides?.[resolvedPartyId]
    : undefined;

  const candidateIds = Object.keys(partySide ?? {});
  const resolvedCandidateId =
    playerCandidateId ??
    (candidateIds.length === 1 ? candidateIds[0] : undefined);
  const candidateConfig = resolvedCandidateId
    ? partySide?.[resolvedCandidateId]
    : undefined;

  const campaignEngine = new CampaignEngine(
    config.candidateListData,
    candidateConfig?.questions ?? [],
    candidateConfig?.answerEffect ?? [],
    container.resolve(ResultModifier),
    container.resolve(EffectApplier),
    container.resolve(MandateCalculator),
    container.resolve(PollsterEngine),
    config.partyListData,
    candidateConfig?.advisorFeedback,
  );

  return { campaignEngine, configEngine };
}
