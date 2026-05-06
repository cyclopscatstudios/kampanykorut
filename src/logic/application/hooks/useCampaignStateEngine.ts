import { container } from "tsyringe";
import { StateEngine } from "../StateEngine";
import type { CampaignState } from "@/logic/domain";

export function useCampaignStateEngine() {
  const engine = container.resolve(StateEngine);

  return {
    updateCampaignState: (state: Partial<CampaignState> | null) =>
      engine.updateCampaignState(state),
  };
}
