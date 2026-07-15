import type { LoaderFunctionArgs } from "react-router";
import { container } from "tsyringe";
import { ConfigEngine } from "@/logic/application";
import { loadCampaignConfig } from "../../logic/application/loadCampaignConfig";

export async function sideSelectorLoader({ params }: LoaderFunctionArgs) {
  const campaignId = params.campaignId;
  if (!campaignId) {
    return { config: null, id: campaignId };
  }

  const config = await loadCampaignConfig(campaignId);
  container.resolve(ConfigEngine).configure(config, campaignId, true);

  return { config, id: campaignId };
}
