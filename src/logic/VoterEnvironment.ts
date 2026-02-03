import { type CandidateListData } from "./ResultTransformer/PipelineTransform";

export interface VoterEnvironmentConfig {
  eligibleVoters: number;
  maxTurnout: number;
  listData: CandidateListData[];
}

type VoterBase = {
  id: string;
  valasztopolgar: number;
};

export class VoterEnvironment {
  private voters: number;
  private voterBases: VoterBase[] = [];
  private maxAvailableVoters: number;

  constructor(config: VoterEnvironmentConfig) {
    this.voters = this.getVoters(config.listData);
    this.maxAvailableVoters =
      this.calculateMaxAvailableVoters(
        config.eligibleVoters,
        config.maxTurnout,
      ) ?? 0;
    this.setVoterBase(config.listData);
  }

  getAvailableVoters() {
    return this.maxAvailableVoters - this.voters;
  }

  setVoters(listData: CandidateListData[]) {
    this.voters = this.getVoters(listData);
  }

  getRemainingVotesInDistricts(districts: CandidateListData[]): number {
    return districts.reduce((sum, district) => {
      return sum + this.getRemainingVoteCount(district);
    }, 0);
  }

  getRemainingVoteCount(district: CandidateListData) {
    const remainingVotesInDistrict =
      district.valasztopolgar ??
      this.voterBases.find(
        (v) => v.id === `${district.megyekod}-${district.oevk}`,
      )?.valasztopolgar ??
      0;
    const allVoteCount =
      Object.values(district.partok).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ??
      0;
    return remainingVotesInDistrict - allVoteCount;
  }

  private setVoterBase(list: CandidateListData[]) {
    this.voterBases = list.map((row) => ({
      id: `${row.megyekod}-${row.oevk}`,
      valasztopolgar: row.valasztopolgar ?? 0,
    }));
  }

  private calculateMaxAvailableVoters(
    eligibleVoters: number,
    maxTurnout: number,
  ) {
    return Math.floor((eligibleVoters * maxTurnout) / 100);
  }

  private getVoters(data: CandidateListData[]) {
    return data.reduce((total, row) => {
      const districtSum = Object.values(row.partok).reduce(
        (sum, votes) => (sum ?? 0) + (votes ?? 0),
        0,
      );
      return total + (districtSum ?? 0);
    }, 0);
  }
}
