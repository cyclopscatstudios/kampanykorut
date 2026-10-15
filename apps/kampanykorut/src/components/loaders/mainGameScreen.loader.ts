import type { LoaderFunctionArgs } from "react-router";
import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";
import { createLogger, setLogTags } from "@/shared/logger";
import { loadCampaignConfig } from "../../logic/application/loadCampaignConfig";

const log = createLogger("mainGameScreenLoader");

export async function mainGameScreenLoader({ params }: LoaderFunctionArgs) {
  const stateEngine = container.resolve(StateEngine);

  const state = stateEngine.getCampaignState();
  const sessionId = stateEngine.getSessionId();

  setLogTags({ campaignId: params.id, sessionId });
  log.info("Loading game screen", {
    campaignId: params.id,
    sessionId,
    hasState: Boolean(state),
    turn: state?.turn,
    stateCampaignId: state?.activeCampaignId,
    playerSide: state?.playerSide,
  });

  if (!state) {
    log.warn("No stored campaign state found for session", {
      campaignId: params.id,
      sessionId,
    });
  } else if (!state.playerSide?.partyId || !state.playerSide?.candidateId) {
    log.warn("Stored campaign state has no complete player side", {
      campaignId: params.id,
      sessionId,
      playerSide: state.playerSide,
    });
  }

  if (state?.isEnded) {
    const path = `/game/${state.activeCampaignId}/end-results?sessionId=${sessionId}`;
    log.info("Campaign already ended, redirecting to end results", { path });
    window.location.href = path;
    return null;
  }

  if (!params.id) {
    log.error("Game route opened without campaign id", { sessionId });
    return null;
  }

  const config = await loadCampaignConfig(params.id);
  container.resolve(ConfigEngine).configure(config, params.id, true);
  log.info("Game screen config ready", { campaignId: params.id, sessionId });

  return null;
}
