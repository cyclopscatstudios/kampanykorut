import { container } from "tsyringe";
import { CampaignStateEngine } from "../CampaignStateEngine";
import type { CampaignState } from "@/logic/domain";

export function useCampaignStateEngine() {
  const engine = container.resolve(CampaignStateEngine);

  return {
    updateCampaignState: (state: Partial<CampaignState> | null) =>
      engine.updateCampaignState(state),
  };
}
