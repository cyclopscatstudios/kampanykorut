import { StorageEngine } from "./StorageEngine";
import type { ElectionConfig } from "../domain/MandateCalculator.types";
import { Emitter } from "./Emitter";

export interface GameSettings {
  showAdvisorFeedback: boolean;
}

export class GameConfigEngine extends Emitter<any> {
  private electionConfig: ElectionConfig;
  private gameSettings: GameSettings;

  constructor(
    private storage: StorageEngine,
    electionConfig: ElectionConfig,
  ) {
    super();
    this.electionConfig = electionConfig;
    this.gameSettings = this.getDefaultGameSettings();
    this.init(this.gameSettings);
  }

  private getDefaultGameSettings(): GameSettings {
    return {
      showAdvisorFeedback: true,
    };
  }

  private init(settings: GameSettings) {
    this.storage.setItem("settings", JSON.stringify(settings), "localStorage");
  }

  getGameSettings(): GameSettings {
    const settings = this.storage.getItem("settings", "localStorage");
    if (!settings) {
      return this.gameSettings;
    }
    return JSON.parse(settings);
  }

  getElectionConfig() {
    return this.electionConfig;
  }

  updateGameConfig(config: Partial<ElectionConfig>) {
    const electionConfig = this.getElectionConfig();
    const newConfig = {
      ...electionConfig,
      ...config,
    };
    this.electionConfig = newConfig;
    this.notify(newConfig);
  }
}
