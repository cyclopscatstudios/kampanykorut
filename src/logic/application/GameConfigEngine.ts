import { StorageEngine } from "./StorageEngine";
import { Emitter } from "./Emitter";
import type { GameSettings } from "../domain";
import type { ElectionConfig } from "../types/campaignEngine.types";
import { singleton, inject } from "tsyringe";
import { createLogger } from "../logger";

const log = createLogger("GameConfigEngine");

@singleton()
export class GameConfigEngine extends Emitter<ElectionConfig> {
  private electionConfig: ElectionConfig | null = null;

  constructor(@inject(StorageEngine) private storage: StorageEngine) {
    log.debug("GameConfigEngine initialized");
    super();
    this.getElectionConfig = this.getElectionConfig.bind(this);
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

  getGameSettings(): GameSettings {
    const stored = this.storage.getItem("settings", "localStorage");
    return stored ? JSON.parse(stored) : { showAdvisorFeedback: true };
  }

  updateGameSettings(settings: Partial<GameSettings>): void {
    const current = this.getGameSettings();
    const updated = { ...current, ...settings };
    this.storage.setItem("settings", JSON.stringify(updated), "localStorage");
  }

  updateGameConfig(config: Partial<ElectionConfig>): void {
    const updated = { ...this.getElectionConfig(), ...config };
    this.electionConfig = updated;
    this.notify(updated);
  }
}
