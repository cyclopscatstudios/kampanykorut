import { StorageEngine } from "../application/StorageEngine";
import type { ElectionConfig } from "./MandateCalculator.types";

interface GameSettings {
  showAdvisorFeedback: boolean;
}

// TODO: rename this to GameConfigEngine
export class ElectionConfigEngine {
  private electionConfig: ElectionConfig;

  constructor(
    private storage: StorageEngine,
    electionConfig: ElectionConfig,
  ) {
    this.electionConfig = electionConfig;
    this.init();
  }

  private init() {
    const settings = {
      showAdvisorFeedback: true,
    };

    this.storage.setItem("settings", JSON.stringify(settings), "localStorage");
  }

  getGameSettings(): GameSettings {
    const settings = this.storage.getItem("settings", "localStorage") ?? "";
    return JSON.parse(settings);
  }

  getElectionConfig() {
    return this.electionConfig;
  }

  setPlayerSide(party: string) {
    this.electionConfig.playerSide = party;
  }
}
