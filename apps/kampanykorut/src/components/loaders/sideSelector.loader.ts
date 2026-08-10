import type { LoaderFunctionArgs } from "react-router";
import { container } from "tsyringe";
import { ConfigEngine } from "@/logic/application";
import { loadCampaignConfig } from "../../logic/application/loadCampaignConfig";
import { createLogger } from "@/shared/logger";

const log = createLogger("sideSelectorLoader");

export async function sideSelectorLoader({ params }: LoaderFunctionArgs) {
  const campaignId = params.campaignId;
  if (!campaignId) {
    log.error("campaign id not found");
    return { config: null, id: campaignId };
  }

  const config = await loadCampaignConfig(campaignId);
  console.log("get config", { config });
  container.resolve(ConfigEngine).configure(config, campaignId, true);

  return { config, id: campaignId };
}
