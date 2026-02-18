import { container } from "tsyringe";
import { StateEngine } from "../StateEngine";

export function useStateEngine() {
  const stateEngine = container.resolve(StateEngine);

  return {
    saveSession: stateEngine.saveSession,
    loadSession: stateEngine.loadSession,
  };
}
