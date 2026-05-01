import { container } from "tsyringe";
import { CampaignStateEngine } from "../CampaignStateEngine";

export function useStateEngine() {
  const stateEngine = container.resolve(CampaignStateEngine);

  return {
    sessionId: stateEngine.getSessionId(),
    saveSession: stateEngine.saveState,
  };
}
