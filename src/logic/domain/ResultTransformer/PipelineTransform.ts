import {
  VoterEnvironment,
  type VoterEnvironmentConfig,
} from "../../VoterEnvironment";
import { VoteAllocationTransform } from "./VoteAllocationTransform";
import { MandateCalculator } from "../MandateCalculator";
import type {
  CandidateListData,
  Shares,
  DistributedVotesResult,
  PartyListData,
} from "./PipelineTransform.types";
import type { ElectionConfig, PartyId } from "../MandateCalculator.types";

export class PipelineTransform {
  private voterEnvironment: VoterEnvironment;
  private voteAllocationTransform: VoteAllocationTransform;
  private mandateCalculator: MandateCalculator;

  constructor(
    voterEnviormentConfig: VoterEnvironmentConfig,
    electionConfig: ElectionConfig,
  ) {
    this.voterEnvironment = new VoterEnvironment(voterEnviormentConfig);
    this.voteAllocationTransform = new VoteAllocationTransform();
    this.mandateCalculator = new MandateCalculator(electionConfig);
  }

  distributeVotesByPartyShare(
    districtCandidateData: CandidateListData[],
    totalVoters: number,
    partyShares: Shares,
  ): DistributedVotesResult | null {
    const remainingCapacity =
      this.voterEnvironment.getRemainingVotesInDistricts(districtCandidateData);

    if (totalVoters > remainingCapacity) {
      return null;
    }

    let result = districtCandidateData.map((d) => ({
      ...d,
      partok: { ...d.partok },
    }));

    for (const [party, share] of Object.entries(partyShares)) {
      const votesForParty = Math.round(totalVoters * share);

      if (votesForParty === 0) {
        continue;
      }

      const weights = this.getPartyWeights(result, party);
      const distributed = this.voteAllocationTransform.distributeByWeights(
        weights,
        votesForParty,
      );

      result = this.voteAllocationTransform.applyPartyDistributionWithCapacity(
        result,
        party,
        distributed,
      );
    }

    const totals = this.mandateCalculator.sumPartyTotals(result);

    return {
      districts: result,
      totals,
      percentages: this.mandateCalculator.calculatePercentages(totals),
      totalVotes: Object.values(totals).reduce((a, b) => a + b, 0),
    };
  }

  modifyByMotivation(
    districtCandidateData: CandidateListData[],
    districtPartyData: PartyListData[],
    motivationTarget: Record<PartyId, number>,
  ) {
    const newCandidateData = districtCandidateData.map((d) => ({
      ...d,
      partok: Object.fromEntries(
        Object.entries(d.partok).map(([party, votes]) => [
          party,
          this.applyMotivationTarget(
            votes as number,
            party as PartyId,
            motivationTarget,
          ),
        ]),
      ),
    }));

    const newPartyData = districtPartyData.map((d) => ({
      ...d,
      partok: Object.fromEntries(
        Object.entries(d.partok).map(([party, votes]) => [
          party,
          this.applyMotivationTarget(
            votes as number,
            party as PartyId,
            motivationTarget,
          ),
        ]),
      ),
    }));

    return {
      newCandidateData,
      newPartyData,
    };
  }

  private applyMotivationTarget(
    votes: number,
    party: PartyId,
    motivationTarget: Record<PartyId, number>,
  ) {
    const target = motivationTarget[party];

    if (target === undefined) {
      return votes;
    }

    const multiplier = Math.max(0, target / 100);
    return Math.round(votes * multiplier);
  }

  private getPartyWeights(
    districtCandidateData: CandidateListData[],
    party: string,
  ): number[] {
    return districtCandidateData.map((d) => d.partok[party] ?? 0);
  }
}
