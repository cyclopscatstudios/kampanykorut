import { Emitter } from "./Emitter";
import type { ElectionConfig } from "../types/campaignEngine.types";
import { singleton } from "tsyringe";
import { createLogger } from "../logger";
import { StorageEngine } from "./StorageEngine";
import { getDataPath } from "./PathResolver";
import type { CampaignHeader } from "./hooks/useGetCampaigns";
import { fetchJSON } from "./fetchJSON";

const log = createLogger("ElectionConfigEngine");

@singleton()
export class ElectionConfigEngine extends Emitter<ElectionConfig> {
  private electionConfig: ElectionConfig | null = null;
  private configured = false;

  constructor(private storage: StorageEngine) {
    log.debug("ElectionConfigEngine initialized");
    super();
    this.storage.setItem = this.storage.setItem.bind(this);
  }

  configure(electionConfig: ElectionConfig | null): void {
    if (this.configured) {
      log.debug(
        "ElectionConfigEngine is already configured, skipping reconfiguration",
      );
      return;
    }
    log.debug("Configuring game with election config", { electionConfig });
    this.electionConfig = electionConfig;
    this.storage.setItem(
      "electionConfig",
      JSON.stringify(electionConfig),
      "localStorage",
    );
    this.configured = true;
  }

  getCurrentElectionConfig() {
    const storedConfig = this.storage.getItem("electionConfig", "localStorage");
    const parsed = storedConfig
      ? (JSON.parse(storedConfig) as ElectionConfig)
      : null;
    return this.electionConfig ?? parsed;
  }

  /* getCurrentCampaignSession() {
    const sessionId =
      this.storage.getItem("currentSessionId", "localStorage") ?? "";
    const storedCampaignSession = this.storage.getItem(
      "campaignState",
      "localStorage",
      sessionId,
    );
    const campaignSession = storedCampaignSession
      ? (JSON.parse(storedCampaignSession) as CampaignState)
      : null;
    return this.currentCampaignSession || campaignSession;
  } */

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

  /* updateCampaignState(session: Partial<CampaignState> | null) {
    if (!session) {
      log.debug("Clearing campaign session");
      this.currentCampaignSession = null;
      this.storage.clearItem("campaignState", "localStorage");
      return;
    }
    const sessionId = this.storage.getItem("currentSessionId", "localStorage");
    const currentCampaignSession = this.getCurrentCampaignSession();
    let updated;
    if (currentCampaignSession) {
      updated = { ...currentCampaignSession };
    }
    updated = { ...updated, ...session };
    this.currentCampaignSession = updated;
    this.storage.setItem(
      `campaignState-${sessionId}`,
      JSON.stringify(updated),
      "localStorage",
    );
  } */

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
