import { CampaignConfig, CampaignManifest } from "@/shared/types";
import { fetchCampaignFile } from "./fetchJSON";
import { getCampaignHeaderById } from "./getCampaignHeaderById";

const cache = new Map<string, Promise<CampaignConfig>>();

export function loadCampaignConfig(
  campaignId: string,
): Promise<CampaignConfig> {
  const cached = cache.get(campaignId);
  if (cached) {
    return cached;
  }

  const promise = fetchCampaignConfig(campaignId);
  cache.set(campaignId, promise);
  return promise;
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

  const entries = await Promise.all(
    (Object.entries(manifest) as [keyof CampaignManifest, string][]).map(
      async ([key, relativePath]) =>
        [
          key,
          await fetchCampaignFile<unknown>(header.route, relativePath),
        ] as const,
    ),
  );

  const data = Object.fromEntries(entries) as unknown as CampaignConfig;

  return {
    ...data,
    questions: data.questions ?? [],
    answerEffect: data.answerEffect ?? [],
    voterEnvironmentConfig: {
      ...data.voterEnvironmentConfig,
      listData: data.candidateListData,
    },
  };
}
