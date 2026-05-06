import { container } from "tsyringe";
import { StateEngine } from "../../logic/application/StateEngine";

export function newGameSelectorLoader() {
  const gameStateEngine = container.resolve(StateEngine);
  gameStateEngine.init();
  return null;
}
