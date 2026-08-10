import { container } from "tsyringe";
import {
  CampaignConfig,
  CampaignManifest,
  CandidateConfig,
  CandidateManifest,
  PlayableSideConfig,
} from "@/shared/types";
import { ConfigEngine } from "./ConfigEngine";
import { fetchCampaignFile } from "./fetchJSON";
import { getCampaignHeaderById } from "./getCampaignHeaderById";
import { cache } from "./loadCampaignConfig.utils";

export function loadCampaignConfig(
  campaignId: string,
): Promise<CampaignConfig> {
  const cached = cache.get(campaignId);
  if (cached) {
    console.log("cached config loaded", {cached});
    return cached;
  }

  const promise = fetchCampaignConfig(campaignId);
  cache.set(campaignId, promise);
  return promise;
}

async function loadCandidateConfig(
  route: string,
  paths: CandidateManifest,
): Promise<CandidateConfig> {
  const [
    questions,
    answerEffect,
    campaignStrategies,
    advisorFeedback,
    advisorFeedbackAssets,
    endResults,
  ] = await Promise.all([
    paths.questions
      ? fetchCampaignFile<CandidateConfig["questions"]>(route, paths.questions)
      : Promise.resolve([]),
    paths.answerEffect
      ? fetchCampaignFile<CandidateConfig["answerEffect"]>(
          route,
          paths.answerEffect,
        )
      : Promise.resolve([]),
    paths.campaignStrategies
      ? fetchCampaignFile<CandidateConfig["campaignStrategies"]>(
          route,
          paths.campaignStrategies,
        )
      : Promise.resolve(undefined),
    paths.advisorFeedback
      ? fetchCampaignFile<CandidateConfig["advisorFeedback"]>(
          route,
          paths.advisorFeedback,
        )
      : Promise.resolve(undefined),
    paths.advisorFeedbackAssets
      ? fetchCampaignFile<CandidateConfig["advisorFeedbackAssets"]>(
          route,
          paths.advisorFeedbackAssets,
        )
      : Promise.resolve(undefined),
    paths.endResults
      ? fetchCampaignFile<CandidateConfig["endResults"]>(
          route,
          paths.endResults,
        )
      : Promise.resolve(undefined),
  ]);

  return {
    questions,
    answerEffect,
    campaignStrategies,
    advisorFeedback,
    advisorFeedbackAssets,
    endResults,
  };
}

async function loadSideConfig(
  route: string,
  candidatePaths: Record<string, CandidateManifest>,
): Promise<PlayableSideConfig> {
  const result: PlayableSideConfig = {};
  await Promise.all(
    Object.entries(candidatePaths).map(async ([candidateId, paths]) => {
      result[candidateId] = await loadCandidateConfig(route, paths);
    }),
  );
  return result;
}

async function fetchCampaignConfig(
  campaignId: string,
): Promise<CampaignConfig> {
  const header = await getCampaignHeaderById(campaignId);
  if (!header) {
    throw new Error(`Unknown campaign: ${campaignId}`);
  }

  const manifest = await fetchCampaignFile<CampaignManifest>(
    header.route,
    "manifest.json",
  );
  const files = manifest.files;

  const commonKeys = [
    "electionConfig",
    "voterEnvironmentConfig",
    "candidateListData",
    "partyListData",
    "customGroups",
    "customPollsters",
  ] as const;

  const commonEntries = await Promise.all(
    commonKeys
      .filter((key) => files[key] !== undefined)
      .map(
        async (key) =>
          [
            key,
            await fetchCampaignFile<unknown>(
              header.route,
              files[key] as string,
            ),
          ] as const,
      ),
  );

  const commonData = Object.fromEntries(commonEntries) as Omit<
    CampaignConfig,
    "playableSides" | "voterEnvironmentConfig" | "districts"
  > & {
    voterEnvironmentConfig: CampaignConfig["voterEnvironmentConfig"];
    candidateListData: CampaignConfig["candidateListData"];
  };

  const districts = await container
    .resolve(ConfigEngine)
    .getDistrictMapByType(commonData.electionConfig.districtMap);

  const playableSides: Record<string, PlayableSideConfig> = {};
  if (files.playableSides) {
    await Promise.all(
      Object.entries(files.playableSides).map(
        async ([partyId, candidatePaths]) => {
          playableSides[partyId] = await loadSideConfig(
            header.route,
            candidatePaths,
          );
        },
      ),
    );
  }

  return {
    ...commonData,
    districts,
    voterEnvironmentConfig: {
      ...commonData.voterEnvironmentConfig,
      listData: commonData.candidateListData,
    },
    playableSides:
      Object.keys(playableSides).length > 0 ? playableSides : undefined,
  };
}
