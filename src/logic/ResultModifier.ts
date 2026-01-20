import {
  VoterEnvironment,
  type VoterEnvironmentConfig,
} from "./VoterEnvironment";
import type { PartyId } from "./ElectionEngine";

export type Shares = Record<string, number>;
type Votes = Record<string, number>;

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

interface DistributedVotesResult {
  districts: DistrictCandidateData[];
  totals: Record<string, number>;
  percentages: Shares;
  totalVotes: number;
}

type VoteSource = { type: "bizonytalan" } | { type: "party"; party: string };

export interface DistrictTarget {
  megyekod: number;
  oevk: number;
  targetParty: string;
  amount: number;
  from?: VoteSource;
}

export class ResultModifier {
  private voterEnvironment: VoterEnvironment;

  constructor(voterEnviormentConfig: VoterEnvironmentConfig) {
    this.voterEnvironment = new VoterEnvironment(voterEnviormentConfig);
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
      const distributed = this.distributeByWeights(weights, votesForParty);

      result = this.applyPartyDistributionWithCapacity(
        result,
        party,
        distributed,
      );
    }

    const totals = this.sumPartyTotals(result);

    return {
      districts: result,
      totals,
      percentages: this.calculatePercentages(totals),
      totalVotes: Object.values(totals).reduce((a, b) => a + b, 0),
    };
  }

  modifyDistricts(
    districtCandidateData: DistrictCandidateData[],
    districtTargets: DistrictTarget[],
  ) {
    return districtTargets.reduce(
      (currentList, target) =>
        currentList.map((row) => this.applyDistrictTarget(row, target)),
      districtCandidateData,
    );
  }

  private applyDistrictTarget(
    districtCandidateData: DistrictCandidateData,
    target: DistrictTarget,
  ): DistrictCandidateData {
    if (
      districtCandidateData.megyekod !== target.megyekod ||
      districtCandidateData.oevk !== target.oevk
    ) {
      return districtCandidateData;
    }

    const from: VoteSource = target.from ?? { type: "bizonytalan" };
    const partok = { ...districtCandidateData.partok };

    let available = 0;

    if (from.type === "bizonytalan") {
      available = this.voterEnvironment.getRemainingVoteCount(
        districtCandidateData,
      );
    } else {
      available = partok[from.party] ?? 0;
    }

    const transfer = Math.max(0, Math.min(target.amount, available));

    if (transfer === 0) {
      return districtCandidateData;
    }

    if (from.type !== "bizonytalan") {
      partok[from.party] = (partok[from.party] ?? 0) - transfer;
    }

    partok[target.targetParty] = (partok[target.targetParty] ?? 0) + transfer;

    return {
      ...districtCandidateData,
      partok,
    };
  }

  modifyListDistricts(
    list: DistrictCandidateData[],
    target: Record<string, number>,
  ) {
    return list.map((row) => ({
      ...row,
      partok: {
        ...row.partok,
        ...target,
      },
    }));
  }

  applyNationalSwingToList(
    districtPartyData: DistrictPartyData[],
    baseShare: Shares,
    targetShare: Shares,
  ) {
    return districtPartyData.map((row) => {
      const votes = this.extractVotes(row.partok);
      return {
        ...row,
        partok: this.applySwing(votes, baseShare, targetShare),
      };
    });
  }

  applyNationalSwingToDistricts(
    districtCandidateData: DistrictCandidateData[],
    baseShare: Shares,
    targetShare: Shares,
  ) {
    return districtCandidateData.map((row) => {
      const votes = this.extractVotes(row.partok);
      const updated = this.applySwing(votes, baseShare, targetShare);

      return {
        ...row,
        partok: {
          ...row.partok,
          ...updated,
        },
      };
    });
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

  sumPartyTotals(districts: DistrictCandidateData[]): Record<string, number> {
    const totals: Record<string, number> = {};

    for (const d of districts) {
      for (const [party, votes] of Object.entries(d.partok)) {
        totals[party] = (totals[party] ?? 0) + (votes ?? 0);
      }
    }

    return totals;
  }

  calculatePercentages(totals: Record<string, number>): Shares {
    const sum = Object.values(totals).reduce((a, b) => a + b, 0);
    const result: Shares = {};

    for (const [party, votes] of Object.entries(totals)) {
      result[party] = sum ? votes / sum : 0;
    }

    return result;
  }

  private getPartyWeights(
    districtCandidateData: DistrictCandidateData[],
    party: string,
  ): number[] {
    return districtCandidateData.map((d) => d.partok[party] ?? 0);
  }

  private applyPartyDistributionWithCapacity(
    districts: DistrictCandidateData[],
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

  private extractVotes(input: Record<string, number | undefined>): Votes {
    return Object.fromEntries(
      Object.entries(input).filter(([, v]) => typeof v === "number"),
    ) as Votes;
  }

  private applySwing(
    votes: Votes,
    baseShare: Shares,
    targetShare: Shares,
  ): Votes {
    const sum = this.sumValues(votes);
    if (!sum) {
      return votes;
    }
    const localShare = this.toShare(votes, sum);
    const lean = this.computeLean(localShare, baseShare);
    const normalizedTarget = this.normalize(targetShare);
    const raw = this.applyTarget(lean, normalizedTarget);

    return this.distributeVotes(raw, sum);
  }

  private normalize(shares: Shares): Shares {
    const sum = this.sumValues(shares);
    if (!sum) {
      return shares;
    }

    const out: Shares = {};
    for (const k in shares) {
      out[k] = shares[k] / sum;
    }
    return out;
  }

  private distributeVotes(raw: Shares, total: number): Votes {
    const keys = Object.keys(raw);
    const norm = this.sumValues(raw);

    if (!norm || !total) {
      return {};
    }

    const result: Votes = {};
    let acc = 0;

    keys.forEach((k, i) => {
      if (i === keys.length - 1) {
        result[k] = Math.max(0, total - acc);
      } else {
        const v = Math.round((raw[k] / norm) * total);
        result[k] = v;
        acc += v;
      }
    });

    return result;
  }

  private applyTarget(lean: Shares, target: Shares): Shares {
    const out: Shares = {};

    for (const k of Object.keys(target)) {
      const l = lean[k] ?? 1;
      out[k] = target[k] * l;
    }

    return out;
  }

  private computeLean(local: Shares, base: Shares): Shares {
    const result: Shares = {};
    for (const k in local) {
      const baseVal = base[k] ?? 0;
      result[k] = baseVal > 0 ? local[k] / baseVal : 1;
    }
    return result;
  }

  private toShare(votes: Votes, sum: number) {
    return Object.fromEntries(
      Object.entries(votes).map(([k, v]) => [k, v / sum]),
    );
  }

  private sumValues(obj: Record<string, number>): number {
    return Object.values(obj).reduce((a, b) => a + b, 0);
  }
}
