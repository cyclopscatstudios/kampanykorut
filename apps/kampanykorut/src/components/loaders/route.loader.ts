import type { LoaderFunctionArgs } from "react-router";
import { loadCampaignConfig } from "../../logic/application/loadCampaignConfig";
import { getDataPath } from "../../logic/application/PathResolver";

const environment = import.meta.env.VITE_ENVIRONMENT;
const showLandingPage = import.meta.env.VITE_LANDING;

export async function rootLoader({ params }: LoaderFunctionArgs) {
  const fallback = getDataPath("background");
  const campaignId = params.id ?? params.campaignId;

  if (!campaignId) {
    return fallback;
  }

  try {
    const config = await loadCampaignConfig(campaignId);
    return config.electionConfig?.background ?? fallback;
  } catch {
    return fallback;
  }
}

export function landingPageRouter() {
  if (showLandingPage) {
    return;
  }
  if (environment === "dev" || environment === "development") {
    window.location.href = "/menu";
  }
}
