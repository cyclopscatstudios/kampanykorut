import type { LoaderFunctionArgs } from "react-router";
import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";
import { createLogger, setLogTags } from "@/shared/logger";
import { loadCampaignConfig } from "../../logic/application/loadCampaignConfig";

const log = createLogger("finalResultLoader");

export async function finalResultLoader({ params }: LoaderFunctionArgs) {
  const id = params.id;
  const stateEngine = container.resolve(StateEngine);
  const configEngine = container.resolve(ConfigEngine);

  const state = stateEngine.getCampaignState();
  if (!state) {
    log.warn("No campaign state found for end results", {
      campaignId: id,
      sessionId: stateEngine.getSessionId(),
    });
    return null;
  }

  const campaignId = id ?? state.activeCampaignId;
  setLogTags({ campaignId, sessionId: stateEngine.getSessionId() });
  log.info("Loading end results", {
    campaignId,
    turn: state.turn,
    isEnded: state.isEnded,
    hasResults: Boolean(state.results),
  });

  if (campaignId) {
    const config = await loadCampaignConfig(campaignId);
    configEngine.configure(config, campaignId, true);
  }

  const config = configEngine.getCampaignConfig(campaignId);

  return { results: state.results, config };
}
