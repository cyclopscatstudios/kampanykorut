import { type LoaderFunctionArgs, redirect } from "react-router";
import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";
import {
  buildCoalitionResult,
  forPlayerSide,
  needsCoalitionOffer,
} from "@/shared/domain";
import { createLogger, setLogTags } from "@/shared/logger";
import { loadCampaignConfig } from "../../logic/application/loadCampaignConfig";

const log = createLogger("coalitionLoader");

export async function coalitionLoader({ params }: LoaderFunctionArgs) {
  const stateEngine = container.resolve(StateEngine);
  const sessionId = stateEngine.getSessionId();
  const campaignId = params.id;
  if (!campaignId) {
    log.error("Coalition route opened without campaign id", { sessionId });
    return redirect("/menu");
  }
  setLogTags({ campaignId, sessionId });
  const endResultsPath = `/game/${campaignId}/end-results?sessionId=${sessionId}`;

  const state = stateEngine.getCampaignState();
  if (!state || state.activeCampaignId !== campaignId || !state.isEnded) {
    log.warn("No finished campaign for the coalition phase", {
      campaignId,
      sessionId,
      isEnded: state?.isEnded,
    });
    return redirect(`/game/${campaignId}?sessionId=${sessionId}`);
  }

  const loaded = await loadCampaignConfig(campaignId);
  container.resolve(ConfigEngine).configure(loaded, campaignId, true);
  const config = forPlayerSide(loaded, state.playerSide);

  if (
    !needsCoalitionOffer(state, config) &&
    !buildCoalitionResult(state, config)
  ) {
    log.info("No coalition phase for this result", { campaignId });
    return redirect(endResultsPath);
  }
  return null;
}
