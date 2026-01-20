import {
  VoterEnvironment,
  type VoterEnvironmentConfig,
} from "../VoterEnvironment";
import type { PartyId } from "../ElectionEngine";
import { VoteAllocationTransform } from "./VoteAllocationTransform";
import { MandateCalculator, type ElectionConfig } from "../MandateCalculator";

export type Shares = Record<string, number>;

export interface DistrictCandidateData {
  megyekod: number;
  megye: string;
  oevk: number;
  telepules: string;
  valasztopolgar: number;
  partok: Record<string, number | undefined>;
  jeloltek?: Record<string, string[] | undefined>;
}

export interface DistrictPartyData {
  megyekod: number;
  megye: string;
  oevk: number;
  partok: Record<string, number | undefined>;
}

export type VoteSource =
  | { type: "bizonytalan" }
  | { type: "party"; party: string };

export interface DistrictTarget {
  megyekod: number;
  oevk: number;
  targetParty: string;
  amount: number;
  from?: VoteSource;
}

export interface DistributedVotesResult {
  districts: DistrictCandidateData[];
  totals: Record<string, number>;
  percentages: Shares;
  totalVotes: number;
}

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
    districtCandidateData: DistrictCandidateData[],
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
    districtCandidateData: DistrictCandidateData[],
    districtPartyData: DistrictPartyData[],
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
    return Math.round(votes * this.clamp(target));
  }

  private clamp(v: number) {
    return Math.min(1, Math.max(0, v));
  }

  private getPartyWeights(
    districtCandidateData: DistrictCandidateData[],
    party: string,
  ): number[] {
    return districtCandidateData.map((d) => d.partok[party] ?? 0);
  }
}
