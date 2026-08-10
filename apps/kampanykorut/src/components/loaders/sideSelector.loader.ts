import type { LoaderFunctionArgs } from "react-router";
import { container } from "tsyringe";
import { ConfigEngine } from "@/logic/application";
import { createLogger } from "@/shared/logger";
import { loadCampaignConfig } from "../../logic/application/loadCampaignConfig";

const log = createLogger("sideSelectorLoader");

export async function sideSelectorLoader({ params }: LoaderFunctionArgs) {
  const campaignId = params.campaignId;

  if (!campaignId) {
    log.error("Campaign id not found");
    return { config: null, id: campaignId };
  }

  try {
    log.debug("Loading campaign config", { campaignId });

    const config = await loadCampaignConfig(campaignId);

    log.debug("Campaign config loaded", {
      campaignId,
      districtMap: config.electionConfig?.districtMap,
      playableSides: Object.keys(config.playableSides ?? {}),
    });

    container.resolve(ConfigEngine).configure(config, campaignId, true);

    log.debug("ConfigEngine configured", { campaignId });

    return {
      config,
      id: campaignId,
    };
  } catch (error) {
    log.error("Side selector loader failed", {
      campaignId,
      error,
    });

    throw error;
  }
}
