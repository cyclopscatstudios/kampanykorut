export class VoterEnvironment {
  private eligibleVoters: number;
  private defaultTurnoutPercentage: number;
  private maximumGuaranteedTurnout: number;

  constructor(
    eligibleVoters = 8215304,
    defaultTurnoutPercentage = 69.59,
    maxTurnoutPercentage: number,
  ) {
    this.eligibleVoters = eligibleVoters;
    this.defaultTurnoutPercentage = defaultTurnoutPercentage;
    this.maximumGuaranteedTurnout =
      this.calculateMaxGuaranteedTurnout(maxTurnoutPercentage);
  }

  private calculateMaxGuaranteedTurnout(percentage: number) {
    this.defaultTurnoutPercentage;
    this.maximumGuaranteedTurnout;
    return Math.floor((this.eligibleVoters * percentage) / 100);
  }
}
