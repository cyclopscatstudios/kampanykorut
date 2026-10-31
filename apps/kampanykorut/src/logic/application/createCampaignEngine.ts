import { container } from "tsyringe";
import {
  CampaignEngine,
  CampaignEventEngine,
  DistrictGroupEngine,
  EffectApplier,
  MandateCalculator,
  MayoralResultCalculator,
  PollsterEngine,
  ResultModifier,
  VoterEnvironment,
} from "@/shared/domain";
import { createLogger } from "@/shared/logger";
import { CampaignConfig } from "@/shared/types";
import { ConfigEngine } from "./ConfigEngine";

const log = createLogger("createCampaignEngine");

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

  if (!candidateConfig && partyIds.length > 0) {
    log.error("Candidate config not found, starting without questions", {
      campaignId,
      playerSideId,
      playerCandidateId,
      resolvedPartyId,
      resolvedCandidateId,
      availableSides: Object.keys(config.playableSides ?? {}),
      availableCandidates: candidateIds,
    });
  } else if (candidateConfig && !candidateConfig.questions?.length) {
    log.warn("Candidate config has no questions", {
      campaignId,
      resolvedPartyId,
      resolvedCandidateId,
    });
  }

  log.info("Creating campaign engine", {
    campaignId,
    partyId: resolvedPartyId,
    candidateId: resolvedCandidateId,
    questionCount: candidateConfig?.questions?.length ?? 0,
  });

  const campaignEngine = new CampaignEngine(
    config.candidateListData,
    candidateConfig?.questions ?? [],
    candidateConfig?.answerEffect ?? [],
    container.resolve(ResultModifier),
    container.resolve(EffectApplier),
    container.resolve(MandateCalculator),
    container.resolve(PollsterEngine),
    container.resolve(MayoralResultCalculator),
    container.resolve(CampaignEventEngine),
    config.partyListData,
    candidateConfig?.advisorFeedback,
    config.campaignEvents,
  );

  return { campaignEngine, configEngine };
}
