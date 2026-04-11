import { Emitter } from "./Emitter";
import type { ElectionConfig } from "../types/campaignEngine.types";
import { inject, singleton } from "tsyringe";
import { createLogger } from "../logger";
import { StorageEngine } from "./StorageEngine";

const log = createLogger("GameConfigEngine");

@singleton()
export class GameConfigEngine extends Emitter<ElectionConfig> {
  private electionConfig: ElectionConfig | null = null;

  constructor(@inject(StorageEngine) private storage: StorageEngine) {
    log.debug("GameConfigEngine initialized");
    super();
    this.getElectionConfig = this.getElectionConfig.bind(this);
    this.storage.setItem = this.storage.setItem.bind(this);
  }

  configure(electionConfig: ElectionConfig | null): void {
    log.debug("Configuring game with election config", { electionConfig });
    this.electionConfig = electionConfig;
  }

  isConfigured(): boolean {
    return this.electionConfig !== null;
  }

  getElectionConfig(): ElectionConfig {
    if (!this.electionConfig) {
      throw new Error("GameConfigEngine: configure() was not called yet");
    }
    return this.electionConfig;
  }

  updateGameConfig(config: Partial<ElectionConfig>): void {
    const updated = { ...this.getElectionConfig(), ...config };
    this.electionConfig = updated;
    this.storage.setItem("gameConfig", JSON.stringify(updated), "localStorage");
    this.notify(updated);
  }
}
