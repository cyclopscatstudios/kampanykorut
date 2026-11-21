import { type LoaderFunctionArgs, redirect } from "react-router";
import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";
import { forPlayerSide, isStrategicMode } from "@/shared/domain";
import { createLogger, setLogTags } from "@/shared/logger";
import { loadCampaignConfig } from "../../logic/application/loadCampaignConfig";

const log = createLogger("politicalDashboardLoader");

export async function politicalDashboardLoader({ params }: LoaderFunctionArgs) {
  const stateEngine = container.resolve(StateEngine);
  const sessionId = stateEngine.getSessionId();
  const campaignId = params.id;
  const gamePath = `/game/${campaignId}?sessionId=${sessionId}`;

  if (!campaignId) {
    log.error("Dashboard route opened without campaign id", { sessionId });
    return redirect("/menu");
  }
  setLogTags({ campaignId, sessionId });

  const state = stateEngine.getCampaignState();
  if (!state || state.activeCampaignId !== campaignId || state.isEnded) {
    log.warn("No playable campaign state for the dashboard", {
      campaignId,
      sessionId,
      hasState: Boolean(state),
      isEnded: state?.isEnded,
    });
    return redirect(gamePath);
  }

  const config = await loadCampaignConfig(campaignId);
  container.resolve(ConfigEngine).configure(config, campaignId, true);

  if (!isStrategicMode(forPlayerSide(config, state.playerSide))) {
    log.info("Classic campaign has no dashboard, back to the game", {
      campaignId,
    });
    return redirect(gamePath);
  }

  return null;
}
