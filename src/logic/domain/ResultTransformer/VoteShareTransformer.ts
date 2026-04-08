import { VoterEnvironment } from "../../VoterEnvironment";
import type {
  Shares,
  PartyListData,
  CandidateListData,
} from "./VoteShareTransformer.types";
import type { PartyId } from "../MandateCalculator.types";
import { inject, singleton } from "tsyringe";

@singleton()
export class VoteShareTransformer {
  constructor(
    @inject(VoterEnvironment) private voterEnviroment: VoterEnvironment,
  ) {}

  distributeVotesByPartyShare(
    districtCandidateData: CandidateListData[],
    partyListData: PartyListData[],
    totalVoters: number,
    partyShares: Shares,
    distributeOnPartyList = true,
  ) {
    const remainingCapacity = this.voterEnviroment.getRemainingVotesInDistricts(
      districtCandidateData,
    );

    if (totalVoters > remainingCapacity) {
      return null;
    }
    const candidateList = this.distributeByCandidateList(
      districtCandidateData,
      totalVoters,
      partyShares,
    );

    let partyList = [...partyListData];

    if (distributeOnPartyList) {
      partyList = this.distributeByPartyList(
        districtCandidateData,
        partyListData,
        totalVoters,
        partyShares,
      );
    }

    return {
      candidateList,
      partyList,
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

  private distributeByPartyList(
    districtCandidateData: CandidateListData[],
    partyListData: PartyListData[],
    totalVoters: number,
    partyShares: Shares,
  ) {
    let result = partyListData.map((d) => ({
      ...d,
      partok: { ...d.partok },
    }));

    for (const [party, share] of Object.entries(partyShares)) {
      const votesForParty = Math.round(totalVoters * share);

      if (votesForParty === 0) {
        continue;
      }

      const weights = this.getPartyWeights(result, party);
      const distributed = this.distributeByWeights(weights, votesForParty);

      result = this.applyPartyDistributionWithCapacityToList(
        result,
        districtCandidateData,
        party,
        distributed,
      );
    }

    return result;
  }

  private distributeByCandidateList(
    districtCandidateData: CandidateListData[],
    totalVoters: number,
    partyShares: Shares,
  ) {
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
      const distributed = this.distributeByWeights(weights, votesForParty);

      result = this.applyPartyDistributionWithCapacity(
        result,
        party,
        distributed,
      );
    }

    return result;
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
    districtCandidateData: Omit<
      CandidateListData,
      "telepules" | "valasztopolgar"
    >[],
    party: string,
  ): number[] {
    return districtCandidateData.map((d) => d.partok[party] ?? 0);
  }

  private distributeByWeights(weights: number[], total: number): number[] {
    const sum = weights.reduce((a, b) => a + b, 0);
    if (!sum || !total) {
      return weights.map(() => 0);
    }

    const raw = weights.map((w) => (w / sum) * total);
    const ints = raw.map((v) => Math.floor(v));

    const remaining = total - ints.reduce((a, b) => a + b, 0);

    const order = raw
      .map((v, i) => ({ i, frac: v - Math.floor(v) }))
      .sort((a, b) => b.frac - a.frac);

    for (let i = 0; i < remaining; i++) {
      ints[order[i].i]++;
    }

    return ints;
  }

  private applyPartyDistributionWithCapacity(
    districts: CandidateListData[],
    party: string,
    distributed: number[],
  ) {
    return districts.map((d, i) => {
      const usedVotes =
        Object.values(d.partok).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0;

      const capacity = (d.valasztopolgar ?? 0) - usedVotes;

      const toApply = Math.max(0, Math.min(distributed[i] ?? 0, capacity));

      return {
        ...d,
        partok: {
          ...d.partok,
          [party]: (d.partok[party] ?? 0) + toApply,
        },
      };
    });
  }

  private applyPartyDistributionWithCapacityToList(
    partyList: PartyListData[],
    districts: CandidateListData[],
    party: string,
    distributed: number[],
  ) {
    return partyList.map((d, i) => {
      const usedVotes =
        Object.values(d.partok).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0;

      const districtCapacity = this.getCapacity(
        districts,
        d.megyekod,
        d.oevk,
      )?.valasztopolgar;
      const capacity = (districtCapacity ?? 0) - usedVotes;

      const toApply = Math.max(0, Math.min(distributed[i] ?? 0, capacity));

      return {
        ...d,
        partok: {
          ...d.partok,
          [party]: (d.partok[party] ?? 0) + toApply,
        },
      };
    });
  }

  private getCapacity(
    districts: CandidateListData[],
    oevk: number,
    megyekod: number,
  ) {
    return districts.find(
      (district) => district.megyekod === megyekod && district.oevk === oevk,
    );
  }
}
