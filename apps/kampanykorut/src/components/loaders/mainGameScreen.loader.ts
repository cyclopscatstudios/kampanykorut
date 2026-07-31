import type { LoaderFunctionArgs } from "react-router";
import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";
import { loadCampaignConfig } from "../../logic/application/loadCampaignConfig";

export async function mainGameScreenLoader({ params }: LoaderFunctionArgs) {
  const stateEngine = container.resolve(StateEngine);

  const state = stateEngine.getCampaignState();
  const sessionId = stateEngine.getSessionId();

  if (!state) {
    return null;
  }

  if (state.isEnded) {
    const path = `/game/${state.activeCampaignId}/end-results?sessionId=${sessionId}`;
    window.location.href = path;
    return null;
  }

  if (params.id) {
    const config = await loadCampaignConfig(params.id);
    container.resolve(ConfigEngine).configure(config, params.id, true);
  }

  return null;
}
