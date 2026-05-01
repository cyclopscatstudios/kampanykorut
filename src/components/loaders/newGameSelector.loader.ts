import { container } from "tsyringe";
import { CampaignStateEngine } from "../../logic/application/CampaignStateEngine";

export function newGameSelectorLoader() {
  const gameStateEngine = container.resolve(CampaignStateEngine);
  gameStateEngine.init();
  return null;
}
