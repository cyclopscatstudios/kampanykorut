import { Emitter } from "./Emitter";
import type { ElectionConfig } from "../types/campaignEngine.types";
import { inject, singleton } from "tsyringe";
import { createLogger } from "../logger";
import { StorageEngine } from "./StorageEngine";
import gameModes from "../../assets/jsons/game_modes.json";

const log = createLogger("GameConfigEngine");

@singleton()
export class GameConfigEngine extends Emitter<ElectionConfig> {
  private electionConfig: ElectionConfig | null = null;

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

  async getElectionConfigById(id?: string) {
    const configHeader = this.getConfigHeader(id);
    const electionConfig = await this.loadElectionConfig(configHeader?.route);
    this.electionConfig = electionConfig;
    return electionConfig;
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
    console.log({ configHeader });
    if (!configHeader) {
      log.error("Config header was not found");
      return;
    }
    return configHeader;
  }

  private async loadElectionConfig(
    route?: string,
  ): Promise<ElectionConfig | null> {
    if (!route) {
      return null;
    }
    const res = await fetch(`/campaigns/${route}/election_config.json`);

    if (!res.ok) {
      throw new Error("Invalid campaign");
    }

    return res.json();
  }
}
