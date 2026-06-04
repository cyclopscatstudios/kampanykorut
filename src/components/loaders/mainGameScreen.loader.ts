import { container } from "tsyringe";
import { StateEngine } from "@/logic/application";

export function mainGameScreenLoader() {
  const stateEngine = container.resolve(StateEngine);

  const state = stateEngine.getCampaignState();
  const sessionId = stateEngine.getSessionId();

  if (!state) {
    return null;
  }

  if (state.isEnded) {
    const path = `/game/${state.activeCampaignId}/end-results?sessionId=${sessionId}`;
    window.location.href = path;
  }

  return null;
}
