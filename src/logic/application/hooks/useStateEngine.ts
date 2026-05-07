import { container } from "tsyringe";
import { StateEngine } from "../StateEngine";

export function useStateEngine() {
  const stateEngine = container.resolve(StateEngine);

  return {
    sessionId: stateEngine.getSessionId(),
    currentState: stateEngine.getCampaignState(),
    currentHistory: stateEngine.getHistory(),
    saveSession: stateEngine.saveState,
  };
}
