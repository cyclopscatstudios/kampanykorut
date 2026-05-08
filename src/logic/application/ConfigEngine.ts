import { Emitter } from "./Emitter";
import type {
  CampaignConfig,
  ElectionConfig,
} from "../types/campaignEngine.types";
import { singleton } from "tsyringe";
import { createLogger } from "../logger";
import { StorageEngine } from "./StorageEngine";
import type { CampaignHeader } from "./hooks/useGetCampaigns";
import { fetchJSON } from "./fetchJSON";
import type { CampaignState } from "../domain";

const log = createLogger("ConfigEngine");

@singleton()
export class ConfigEngine extends Emitter<CampaignConfig> {
  private campaignConfig: CampaignConfig | null = null;
  private configured = false;

  constructor(private storage: StorageEngine) {
    log.debug("ElectionConfigEngine initialized");
    super();
    this.storage.setItem = this.storage.setItem.bind(this);
  }

  configure(
    campaignConfig: CampaignConfig | null,
    id?: string,
    forced = false,
  ): void {
    if (this.configured && !forced) {
      log.debug("ConfigEngine is already configured, skipping reconfiguration");
      return;
    }
    log.debug("Configuring game with campaign config", { campaignConfig });
    this.setCampaignConfig(campaignConfig, id);
  }

  getCurrentElectionConfig() {
    if (this.campaignConfig?.electionConfig) {
      return this.campaignConfig.electionConfig;
    }
    const sessionId = this.storage.getItem("currentSessionId", "localStorage");
    const state = this.storage.getItem(
      "campaignState",
      "localStorage",
      sessionId ?? "",
    );
    const parsedState: CampaignState | null = state ? JSON.parse(state) : null;
    if (!parsedState?.activeCampaignId) {
      log.error("no saved campaign id was found");
      return;
    }
    const storedConfig = this.storage.getItem(
      "campaignConfig",
      "localStorage",
      parsedState.activeCampaignId,
    );
    return storedConfig ? (JSON.parse(storedConfig) as ElectionConfig) : null;
  }

  getCampaignConfig(id?: string): CampaignConfig {
    const campaignId = id ?? this.getActiveCampaignId() ?? "";
    const config = this.storage.getItem(
      "campaignConfig",
      "localStorage",
      campaignId,
    );
    const parsed = config ? JSON.parse(config) : null;
    return this.campaignConfig ?? parsed;
  }

  async getElectionConfigById(id?: string) {
    const configHeader = await this.getConfigHeader(id);
    const electionConfig = await fetchJSON<ElectionConfig>(
      "electionConfig",
      configHeader?.route,
    );
    return electionConfig;
  }

  private getActiveCampaignId() {
    const sessionId = this.storage.getItem("currentSessionId", "localStorage");
    const state = this.storage.getItem(
      "campaignState",
      "localStorage",
      sessionId ?? "",
    );
    const parsedState: CampaignState = state ? JSON.parse(state) : null;
    if (!parsedState) {
      log.error("state was not found");
      return;
    }
    return parsedState.activeCampaignId;
  }

  private setCampaignConfig(config: CampaignConfig | null, id?: string) {
    this.campaignConfig = config;
    if (!id) {
      log.debug("Clearing campaign config");
      return this.storage.clearItem("campaignConfig", "localStorage");
    }
    const value = JSON.stringify(config);
    this.storage.setItem("campaignConfig", value, "localStorage", id);
    this.configured = true;
  }

  private async getConfigHeader(
    id?: string,
  ): Promise<CampaignHeader | undefined> {
    if (!id) {
      log.error("Game mode id was not provided");
      return;
    }
    const campaigns = await fetchJSON<CampaignHeader[]>("campaigns");
    const configHeader = campaigns?.find(
      (config: CampaignHeader) => config.id === id,
    );
    if (!configHeader) {
      log.error("Config header was not found");
      return;
    }
    return configHeader;
  }
}
