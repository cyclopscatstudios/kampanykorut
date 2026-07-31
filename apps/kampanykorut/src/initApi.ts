import { createLogger } from "@/shared/logger";
import { initCampaignDebug } from "./debug/campaignDebug";
import { initCampaignApi } from "./testing/campaignSeeder";

const log = createLogger("initDevApi");

export function initDevApi() {
  log.debug("Initializing development API");

  initCampaignDebug();
  initCampaignApi();
}
