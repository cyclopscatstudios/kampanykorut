import type { LoaderFunctionArgs } from "react-router";
import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";
import { loadCampaignConfig } from "../../logic/application/loadCampaignConfig";

export async function finalResultLoader({ params }: LoaderFunctionArgs) {
  const id = params.id;
  const stateEngine = container.resolve(StateEngine);
  const configEngine = container.resolve(ConfigEngine);

  const state = stateEngine.getCampaignState();
  if (!state) {
    return null;
  }

  const campaignId = id ?? state.activeCampaignId;
  if (campaignId) {
    const config = await loadCampaignConfig(campaignId);
    configEngine.configure(config, campaignId, true);
  }

  const config = configEngine.getCampaignConfig(campaignId);

  return { results: state.results, config };
}
