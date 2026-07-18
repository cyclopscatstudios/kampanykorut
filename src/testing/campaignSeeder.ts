import { container } from "tsyringe";
import {
  ConfigEngine,
  loadCampaignConfig,
  StateEngine,
} from "@/logic/application";
import { PlayerSide } from "@/shared/types";

export class CampaignApi {
  constructor(
    private configEngine: ConfigEngine,
    private stateEngine: StateEngine,
  ) {}

  async seedCampaign(campaignId: string, playerSide?: PlayerSide) {
    const config = await loadCampaignConfig(campaignId);
    this.configEngine.configure(config, campaignId, true);
    this.stateEngine.updateCampaignState({
      activeCampaignId: campaignId,
      playerSide,
    });
    return {
      sessionId: this.stateEngine.getSessionId(),
      state: this.stateEngine.getCampaignState(),
    };
  }

  getCampaignState() {
    return this.stateEngine.getCampaignState();
  }
}

declare global {
  interface Window {
    kampanykorut?: CampaignApi;
  }
}

export function initCampaignApi() {
  if (!import.meta.env.DEV || window.kampanykorut) {
    return;
  }

  window.kampanykorut = new CampaignApi(
    container.resolve(ConfigEngine),
    container.resolve(StateEngine),
  );
}
