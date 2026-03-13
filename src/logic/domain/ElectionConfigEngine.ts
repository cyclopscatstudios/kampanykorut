import { StorageEngine } from "../application/StorageEngine";
import type { ElectionConfig } from "./MandateCalculator.types";

// TODO: rename this to GameConfigEngine
export class ElectionConfigEngine {
  private electionConfig: ElectionConfig;

  constructor(private storage: StorageEngine, electionConfig: ElectionConfig) {
    this.electionConfig = electionConfig;
    this.init();
  }

private init() {
  const currentSettings = this.storage.getItem('settings', 'localStorage');

  if (!currentSettings) {
    const defaults = { showAdvisorFeedback: true };
    return this.storage.setItem(
      'settings',
      JSON.stringify(defaults),
      'localStorage'
    );
  }

  let parsed: any;

  try {
    parsed = JSON.parse(currentSettings);
  } catch {
    parsed = {};
  }

  const newSettings = {
    ...parsed,
    showAdvisorFeedback: parsed.showAdvisorFeedback ?? true,
  };

  this.storage.setItem(
    'settings',
    JSON.stringify(newSettings),
    'localStorage'
  );
}

  getElectionConfig() {
    return this.electionConfig;
  }

  setPlayerSide(party: string) {
    this.electionConfig.playerSide = party;
  }
}
