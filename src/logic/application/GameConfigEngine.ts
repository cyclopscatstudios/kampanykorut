import { Emitter } from "./Emitter";
import type { ElectionConfig, PlayerSide } from "../types/campaignEngine.types";
import { inject, singleton } from "tsyringe";
import { createLogger } from "../logger";
import { StorageEngine } from "./StorageEngine";
import gameModes from "../../assets/jsons/game_modes.json";
import { getDataPath } from "./PathResolver";

const log = createLogger("GameConfigEngine");

export interface CampaignState {
  campaignId: string;
  playerSide: PlayerSide;
}

@singleton()
export class GameConfigEngine extends Emitter<ElectionConfig> {
  private electionConfig: ElectionConfig | null = null;
  private currentCampaignId: string | undefined;
  private currentCampaignSession: Partial<CampaignState> | null = null;

  constructor(@inject(StorageEngine) private storage: StorageEngine) {
    log.debug("GameConfigEngine initialized");
    super();
    this.storage.setItem = this.storage.setItem.bind(this);
  }

  configure(electionConfig: ElectionConfig | null): void {
    log.debug("Configuring game with election config", { electionConfig });
    this.electionConfig = electionConfig;
  }

  getCurrentElectionConfig() {
    return this.electionConfig;
  }

  getCurrentCampaignId() {
    return this.currentCampaignId;
  }

  getCurrentCampaignSession() {
    const storedCampaignSession = this.storage.getItem(
      "campaignSession",
      "localStorage",
    );
    const campaignSession = storedCampaignSession
      ? (JSON.parse(storedCampaignSession) as CampaignState)
      : null;
    return this.currentCampaignSession || campaignSession;
  }

  async getElectionConfigById(id?: string) {
    const configHeader = this.getConfigHeader(id);
    const electionConfigPath = getDataPath(
      "electionConfig",
      configHeader?.route ?? "",
    );
    const electionConfig = await this.loadAssets(electionConfigPath);
    this.currentCampaignId = id;
    this.electionConfig = electionConfig;
    return electionConfig;
  }

  updateCampaignState(session: Partial<CampaignState>) {
    const currentCampaignSession = this.getCurrentCampaignSession();
    let updated;
    if (currentCampaignSession) {
      updated = { ...currentCampaignSession };
    }
    updated = { ...updated, ...session };
    this.currentCampaignSession = updated;
    this.storage.setItem(
      "campaignSession",
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

  private getConfigHeader(id?: string) {
    if (!id) {
      log.error("Game mode id was not provided");
      return;
    }
    const configHeader = gameModes.find((config) => config.id === id);
    if (!configHeader) {
      log.error("Config header was not found");
      return;
    }
    return configHeader;
  }

  private async loadAssets(path: string): Promise<ElectionConfig | null> {
    if (!path) {
      return null;
    }
    const res = await fetch(path);

    if (!res.ok) {
      throw new Error("Invalid campaign");
    }

    return res.json();
  }
}
