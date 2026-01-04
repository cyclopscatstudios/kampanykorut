import {
  type ConstituencyDataProps,
  type PartyListDataProps,
} from "./ResultModifier";

export interface VoterEnvironmentConfig {
  eligibleVoters: number;
  maxTurnout: number;
  listData: PartyListDataProps[];
}

export class VoterEnvironment {
  private voters: number;
  private maxAvailableVoters: number;

  constructor(config: VoterEnvironmentConfig) {
    this.voters = this.getVoters(config.listData);
    this.maxAvailableVoters =
      this.calculateMaxAvailableVoters(
        config.eligibleVoters,
        config.maxTurnout,
      ) ?? 0;
  }

  getAvailableVoters() {
    return this.maxAvailableVoters - this.voters;
  }

  setVoters(listData: PartyListDataProps[]) {
    this.voters = this.getVoters(listData);
  }

  private calculateMaxAvailableVoters(
    eligibleVoters: number,
    maxTurnout: number,
  ) {
    return Math.floor((eligibleVoters * maxTurnout) / 100);
  }

  private getVoters(data: ConstituencyDataProps[]) {
    return data.reduce((total, row) => {
      const districtSum = Object.values(row.partok).reduce(
        (sum, votes) => (sum ?? 0) + (votes ?? 0),
        0,
      );
      return total + (districtSum ?? 0);
    }, 0);
  }
}
