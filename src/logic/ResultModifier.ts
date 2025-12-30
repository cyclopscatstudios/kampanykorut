type Shares = Record<string, number>;
type Votes = Record<string, number>;

export interface OevkResult {
  megyekod: number;
  megye: string;
  oevk: number;
  telepules?: string;
  valasztopolgar?: number;
  partok: Record<string, number | undefined>;
  jeloltek?: Record<string, string[] | undefined>;
}

type VoterBase = {
  id: string;
  valasztopolgar: number;
};

type VoteTarget = {
  target: string;
  vote: number;
  from: string;
};

export class ResultModifier {
  private voterBases: VoterBase[] = [];

  constructor(list: OevkResult[]) {
    this.setVoterBase(list);
  }

  private setVoterBase(list: OevkResult[]) {
    this.voterBases = list.map((row) => ({
      id: `${row.megyekod}-${row.oevk}`,
      valasztopolgar: row.valasztopolgar ?? 0,
    }));
  }

  modifyDistrict(
    list: OevkResult[],
    megyekod: number,
    oevk: number,
    target: Record<string, number>[],
    from: string = "bizonytalan",
  ): OevkResult[] {
    return list.map((row) => {
      if (row.megyekod !== megyekod || row.oevk !== oevk) {
        return row;
      }

      if (from === "bizonytalan") {
        const voterBase = this.voterBases.find(
          (v) => v.id === `${megyekod}-${oevk}`,
        );
        console.log({ voterBase });
      }

      return {
        ...row,
        partok: {
          ...row.partok,
          ...Object.assign({}, ...target),
        },
      };
    });
  }

  modifyListDistricts(
    list: OevkResult[],
    target: Record<string, number>[],
  ): OevkResult[] {
    return list.map((row) => ({
      ...row,
      partok: {
        ...row.partok,
        ...Object.assign({}, ...target),
      },
    }));
  }

  applyNationalSwingToList(
    list: OevkResult[],
    baseShare: Shares,
    targetShare: Shares,
  ): OevkResult[] {
    return list.map((row) => {
      const votes = this.extractVotes(row.partok);
      return {
        ...row,
        partok: this.applySwing(votes, baseShare, targetShare),
      };
    });
  }

  applyNationalSwingToDistricts(
    list: OevkResult[],
    baseShare: Shares,
    targetShare: Shares,
  ): OevkResult[] {
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
    if (!sum) return votes;

    const localShare = this.toShare(votes);
    const lean = this.computeLean(localShare, baseShare);
    const raw = this.applyTarget(lean, targetShare);

    return this.distributeVotes(raw, sum);
  }

  private distributeVotes(raw: Shares, total: number): Votes {
    const norm = this.sumValues(raw);
    if (!norm || !total) return {};

    const keys = Object.keys(raw);
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
    for (const k in lean) {
      out[k] = Math.max(0, lean[k] * (target[k] ?? 0));
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

  private toShare(votes: Votes): Shares {
    const sum = this.sumValues(votes);
    if (!sum) return {};
    return Object.fromEntries(
      Object.entries(votes).map(([k, v]) => [k, v / sum]),
    );
  }

  private sumValues(obj: Record<string, number>): number {
    return Object.values(obj).reduce((a, b) => a + b, 0);
  }
}
