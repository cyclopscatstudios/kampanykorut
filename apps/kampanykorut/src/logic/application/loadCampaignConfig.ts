import { container } from "tsyringe";
import { createLogger } from "@/shared/logger";
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

const log = createLogger("loadCampaignConfig");

export function loadCampaignConfig(
  campaignId: string,
): Promise<CampaignConfig> {
  const cached = cache.get(campaignId);

  if (cached) {
    log.debug("Cached config loaded", { campaignId });
    return cached;
  }

  const promise = (campaignId.startsWith("preview-")
    ? loadPreviewCampaignConfig(campaignId)
    : fetchCampaignConfig(campaignId)
  ).catch((error) => {
    cache.delete(campaignId);

    log.error("Failed to load campaign config", {
      campaignId,
      error,
    });

    throw error;
  });

  cache.set(campaignId, promise);

  return promise;
}

interface PreviewRecord {
  expiresAt: number;
  bundle: { files: Record<string, unknown> };
}

async function loadPreviewCampaignConfig(campaignId: string): Promise<CampaignConfig> {
  const previewId = campaignId.slice("preview-".length);
  const raw = localStorage.getItem(`kampanykorut_maker_preview_v1-${previewId}`);
  if (!raw) throw new Error("A helyi előnézet nem található vagy már törölve lett.");
  const record = JSON.parse(raw) as PreviewRecord;
  if (record.expiresAt < Date.now()) {
    localStorage.removeItem(`kampanykorut_maker_preview_v1-${previewId}`);
    throw new Error("A helyi előnézet lejárt. Indítsd újra a Kampánykészítőből.");
  }
  const files = record.bundle.files;
  const read = <T>(path: string) => {
    if (!Object.prototype.hasOwnProperty.call(files, path)) throw new Error(`Hiányzó előnézeti fájl: ${path}`);
    return files[path] as T;
  };
  const manifest = read<CampaignManifest>("manifest.json");
  const manifestFiles = manifest.files;
  const electionConfig = read<CampaignConfig["electionConfig"]>(manifestFiles.electionConfig);
  const voterEnvironmentConfig = read<CampaignConfig["voterEnvironmentConfig"]>(manifestFiles.voterEnvironmentConfig);
  const candidateListData = read<CampaignConfig["candidateListData"]>(manifestFiles.candidateListData);
  const playableSides: Record<string, PlayableSideConfig> = {};
  for (const [partyId, candidates] of Object.entries(manifestFiles.playableSides ?? {})) {
    playableSides[partyId] = {};
    for (const [candidateId, paths] of Object.entries(candidates)) {
      playableSides[partyId][candidateId] = {
        questions: paths.questions ? read(paths.questions) : [],
        answerEffect: paths.answerEffect ? read(paths.answerEffect) : [],
        campaignStrategies: paths.campaignStrategies ? read(paths.campaignStrategies) : undefined,
        advisorFeedback: paths.advisorFeedback ? read(paths.advisorFeedback) : undefined,
        advisorFeedbackAssets: paths.advisorFeedbackAssets ? read(paths.advisorFeedbackAssets) : undefined,
        endResults: paths.endResults ? read(paths.endResults) : undefined,
      };
    }
  }
  const districts = await container.resolve(ConfigEngine).getDistrictMapByType(electionConfig.districtMap);
  return {
    electionConfig,
    voterEnvironmentConfig: { ...voterEnvironmentConfig, listData: candidateListData },
    candidateListData,
    districts,
    customGroups: manifestFiles.customGroups ? read(manifestFiles.customGroups) : undefined,
    customPollsters: manifestFiles.customPollsters ? read(manifestFiles.customPollsters) : undefined,
    partyListData: manifestFiles.partyListData ? read(manifestFiles.partyListData) : undefined,
    playableSides,
  };
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
