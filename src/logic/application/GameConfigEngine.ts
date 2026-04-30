import { Emitter } from "./Emitter";
import type { ElectionConfig } from "../types/campaignEngine.types";
import { inject, singleton } from "tsyringe";
import { createLogger } from "../logger";
import { StorageEngine } from "./StorageEngine";
import { getDataPath } from "./PathResolver";
import type { CampaignHeader } from "./hooks/useGetCampaigns";
import { fetchJSON } from "./fetchJSON";
import type { CampaignState } from "./GameStateEngine";

const log = createLogger("GameConfigEngine");

@singleton()
export class GameConfigEngine extends Emitter<ElectionConfig> {
  private electionConfig: ElectionConfig | null = null;
  private currentCampaignSession: Partial<CampaignState> | null = null;
  private configured = false;

  constructor(@inject(StorageEngine) private storage: StorageEngine) {
    log.debug("GameConfigEngine initialized");
    super();
    this.storage.setItem = this.storage.setItem.bind(this);
  }

  configure(electionConfig: ElectionConfig | null): void {
    if (this.configured) {
      log.debug(
        "GameConfigEngine is already configured, skipping reconfiguration",
      );
      return;
    }
    log.debug("Configuring game with election config", { electionConfig });
    this.electionConfig = electionConfig;
    this.configured = true;
  }

  getCurrentElectionConfig() {
    return this.electionConfig;
  }

  getCurrentCampaignSession() {
    const storedCampaignSession = this.storage.getItem(
      "campaignState",
      "localStorage",
    );
    const campaignSession = storedCampaignSession
      ? (JSON.parse(storedCampaignSession) as CampaignState)
      : null;
    return this.currentCampaignSession || campaignSession;
  }

  async getElectionConfigById(id?: string) {
    const configHeader = await this.getConfigHeader(id);
    const electionConfigPath = getDataPath(
      "electionConfig",
      configHeader?.route ?? "",
    );
    const electionConfig = await fetchJSON<ElectionConfig>(electionConfigPath);
    this.electionConfig = electionConfig;
    return electionConfig;
  }

  updateCampaignState(session: Partial<CampaignState> | null) {
    if (!session) {
      log.debug("Clearing campaign session");
      this.currentCampaignSession = null;
      this.storage.clearItem("campaignState", "localStorage");
      return;
    }
    const currentCampaignSession = this.getCurrentCampaignSession();
    let updated;
    if (currentCampaignSession) {
      updated = { ...currentCampaignSession };
    }
    updated = { ...updated, ...session };
    this.currentCampaignSession = updated;
    this.storage.setItem(
      "campaignState",
      JSON.stringify(updated),
      "localStorage",
    );
  }

  updateGameConfig(config: Partial<ElectionConfig>): void {
    const currentElectionConfig = this.getCurrentElectionConfig();
    if (!currentElectionConfig) {
      return;
    }
    const updated = { ...currentElectionConfig, ...config };
    this.electionConfig = updated;
    this.storage.setItem("gameConfig", JSON.stringify(updated), "localStorage");
    this.notify(updated);
  }

  private async getConfigHeader(
    id?: string,
  ): Promise<CampaignHeader | undefined> {
    if (!id) {
      log.error("Game mode id was not provided");
      return;
    }
    const pathToCampaigns = getDataPath("campaigns");
    const campaigns = await fetchJSON<CampaignHeader[]>(pathToCampaigns);
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
