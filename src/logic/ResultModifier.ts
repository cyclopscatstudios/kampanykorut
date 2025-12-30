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
    targetParty: string,
    amount: number,
    from: string = "bizonytalan",
  ): OevkResult[] {
    return list.map((row) => {
      if (row.megyekod !== megyekod || row.oevk !== oevk) {
        return row;
      }

      const partok = { ...row.partok };

      let available = 0;

      if (from === "bizonytalan") {
        available = this.getRemainingVoteCount(row);
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

  private getRemainingVoteCount(district: OevkResult) {
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
