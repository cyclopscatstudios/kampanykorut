import { container } from "tsyringe";
import { GameStateEngine } from "../GameStateEngine";

export function useStateEngine() {
  const stateEngine = container.resolve(GameStateEngine);

  return {
    sessionId: stateEngine.getSessionId(),
    saveSession: stateEngine.saveElectionState,
  };
}
