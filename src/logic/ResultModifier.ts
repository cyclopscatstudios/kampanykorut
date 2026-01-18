import {
  VoterEnvironment,
  type VoterEnvironmentConfig,
} from "./VoterEnvironment";
import { sumPartyTotals as sum } from "./ResultModifier.utils";
import type { PartyId } from "./ElectionEngine";

export type Shares = Record<string, number>;
type Votes = Record<string, number>;

export interface ConstituencyDataProps {
  megyekod: number;
  megye: string;
  oevk: number;
  telepules: string;
  valasztopolgar?: number;
  partok: Record<string, number | undefined>;
  jeloltek?: Record<string, string[] | undefined>;
}

export interface PartyListDataProps {
  megyekod: number;
  megye: string;
  oevk: number;
  partok: Record<string, number | undefined>;
}

interface DistributedVotesResult {
  districts: ConstituencyDataProps[];
  totals: Record<string, number>;
  percentages: Shares;
  totalVotes: number;
}

export class ResultModifier {
  private voterEnvironment: VoterEnvironment;

  constructor(voterEnviormentConfig: VoterEnvironmentConfig) {
    this.voterEnvironment = new VoterEnvironment(voterEnviormentConfig);
  }

  distributeVotesByPartyShare(
    list: ConstituencyDataProps[],
    totalVotes: number,
    partyShares: Shares,
  ): DistributedVotesResult | null {
    if (totalVotes > this.voterEnvironment.getAvailableVoters()) {
      return null;
    }
    let result = list.map((r) => ({
      ...r,
      partok: { ...r.partok },
    }));

    for (const [party, share] of Object.entries(partyShares)) {
      const partyTotal = Math.round(totalVotes * share);

      const weights = this.getPartyWeights(result, party);
      const distributed = this.distributeByWeights(weights, partyTotal);

      result = this.applyPartyDistributionImmutable(result, party, distributed);
    }

    const totals = this.sumPartyTotals(result);
    const percentages = this.calculatePercentages(totals);

    return {
      districts: result,
      totals,
      percentages,
      totalVotes: Object.values(totals).reduce((a, b) => a + b, 0),
    };
  }

  modifyDistrict(
    list: ConstituencyDataProps[],
    megyekod: number,
    oevk: number,
    targetParty: string,
    amount: number,
    from: string = "bizonytalan",
  ) {
    return list.map((row) => {
      if (row.megyekod !== megyekod || row.oevk !== oevk) {
        return row;
      }

      const partok = { ...row.partok };

      let available = 0;

      if (from === "bizonytalan") {
        available = this.voterEnvironment.getRemainingVoteCount(row);
      } else {
        available = partok[from] ?? 0;
      }

      const transfer = Math.max(0, Math.min(amount, available));

      if (transfer === 0) {
        return row;
      }

      if (from !== "bizonytalan") {
        partok[from] = (partok[from] ?? 0) - transfer;
      }

      partok[targetParty] = (partok[targetParty] ?? 0) + transfer;

      return {
        ...row,
        partok,
      };
    });
  }

  modifyListDistricts(
    list: ConstituencyDataProps[],
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
    list: PartyListDataProps[],
    baseShare: Shares,
    targetShare: Shares,
  ) {
    return list.map((row) => {
      const votes = this.extractVotes(row.partok);
      return {
        ...row,
        partok: this.applySwing(votes, baseShare, targetShare),
      };
    });
  }

  applyNationalSwingToDistricts(
    list: ConstituencyDataProps[],
    baseShare: Shares,
    targetShare: Shares,
  ) {
    return list.map((row) => {
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
    constituencyData: ConstituencyDataProps[],
    partyListData: PartyListDataProps[],
    motivationTarget: Record<PartyId, number>,
  ) {
    const newConstituencyData = constituencyData.map((d) => ({
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

    const newPartyListData = partyListData.map((d) => ({
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
      newConstituencyData,
      newPartyListData,
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

  sumPartyTotals(districts: ConstituencyDataProps[]): Record<string, number> {
    return sum(districts);
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
    districts: ConstituencyDataProps[],
    party: string,
  ): number[] {
    return districts.map((d) => d.partok[party] ?? 0);
  }

  private applyPartyDistributionImmutable(
    districts: ConstituencyDataProps[],
    party: string,
    distributed: number[],
  ) {
    return districts.map((row, i) => ({
      ...row,
      partok: {
        ...row.partok,
        [party]: (row.partok[party] ?? 0) + (distributed[i] ?? 0),
      },
    }));
  }

  private distributeByWeights(weights: number[], total: number): number[] {
    const sum = weights.reduce((a, b) => a + b, 0);
    if (!sum || !total) return weights.map(() => 0);

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

  normalize(shares: Shares): Shares {
    const sum = this.sumValues(shares);
    if (!sum) return shares;

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

  getSumVotes() {
    return this.voterEnvironment.getAvailableVoters();
  }
}
