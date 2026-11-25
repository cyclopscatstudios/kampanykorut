import { StateEngine } from "@logic/application/StateEngine";
import { container } from "tsyringe";

export function newGameSelectorLoader() {
  const gameStateEngine = container.resolve(StateEngine);
  gameStateEngine.init();
  return null;
}
