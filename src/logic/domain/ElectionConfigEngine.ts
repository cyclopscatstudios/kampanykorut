import type { ElectionConfig } from "./MandateCalculator.types";

export class ElectionConfigEngine {
  private electionConfig: ElectionConfig;

  constructor(electionConfig: ElectionConfig) {
    this.electionConfig = electionConfig;
  }

  getElectionConfig() {
    return this.electionConfig;
  }

  setPlayerSide(party: string) {
    this.electionConfig.playerSide = party;
  }
}
