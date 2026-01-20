import type {
  DistrictCandidateData,
  DistrictPartyData,
  Shares,
} from "./PipelineTransform";
type Votes = Record<string, number>;

export class NationalSwingTransform {
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

  private computeLean(local: Shares, base: Shares): Shares {
    const result: Shares = {};
    for (const k in local) {
      const baseVal = base[k] ?? 0;
      result[k] = baseVal > 0 ? local[k] / baseVal : 1;
    }
    return result;
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

  private extractVotes(input: Record<string, number | undefined>): Votes {
    return Object.fromEntries(
      Object.entries(input).filter(([, v]) => typeof v === "number"),
    ) as Votes;
  }

  private applyTarget(lean: Shares, target: Shares): Shares {
    const out: Shares = {};

    for (const k of Object.keys(target)) {
      const l = lean[k] ?? 1;
      out[k] = target[k] * l;
    }

    return out;
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
