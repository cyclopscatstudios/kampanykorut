import {
  MandateCalculator,
  type CombinedOevk,
  type ElectionConfig,
} from "./MandateCalculator";

export type PartyId = string;

type PartyVotesRaw = Record<PartyId, number | undefined>;
type PartyVotes = Record<PartyId, number>;

type CandidateMapRaw = Record<PartyId, string[] | undefined>;
type CandidateMap = Record<PartyId, string[]>;

interface ConstituencyInput {
  megyekod: number;
  megye: string;
  oevk: number;
  telepules?: string;
  valasztopolgar?: number;

  partok: PartyVotesRaw;
  jeloltek?: CandidateMapRaw;
}

interface ListVoteInput {
  megyekod: number;
  megye: string;
  oevk: number;
  partok: PartyVotesRaw;
}

export class ElectionEngine {
  private mandateCalculator: MandateCalculator;

  constructor(
    private constituencyData: ConstituencyInput[],
    private listData: ListVoteInput[],
    private config: ElectionConfig,
  ) {
    this.mandateCalculator = new MandateCalculator(this.config);
  }

  private merge(): CombinedOevk[] {
    const map = new Map<string, CombinedOevk>();

    for (const c of this.constituencyData) {
      const key = `${c.megyekod}-${c.oevk}`;

      map.set(key, {
        megyekod: c.megyekod,
        megye: c.megye,
        oevk: c.oevk,
        constituencyVotes: this.cleanVotes(c.partok),
        listVotes: {},
        candidates: this.cleanCandidates(c.jeloltek),
      });
    }

    for (const l of this.listData) {
      const key = `${l.megyekod}-${l.oevk}`;
      const row = map.get(key);
      if (!row) {
        continue;
      }

      row.listVotes = this.cleanVotes(l.partok);
    }

    return [...map.values()];
  }

  private cleanVotes(votes: PartyVotesRaw) {
    const out: PartyVotes = {};
    for (const [party, value] of Object.entries(votes)) {
      if (typeof value === "number" && value > 0) {
        out[party] = value;
      }
    }
    return out;
  }

  private cleanCandidates(input?: CandidateMapRaw): CandidateMap {
    const out: CandidateMap = {};
    if (!input) {
      return out;
    }

    for (const [party, names] of Object.entries(input)) {
      if (Array.isArray(names) && names.length > 0) {
        out[party] = names;
      }
    }

    return out;
  }

  calculate() {
    const merged = this.merge();

    const constituencySeats =
      this.mandateCalculator.calculateConstituencySeats(merged);
    const compensation = this.mandateCalculator.calculateCompensation(merged);

    const listTotals: PartyVotes = {};
    for (const row of merged) {
      for (const [party, votes] of Object.entries(row.listVotes)) {
        listTotals[party] = (listTotals[party] ?? 0) + votes;
      }
    }

    const listSeats = this.mandateCalculator.allocateListSeats(
      listTotals,
      compensation.total,
    );

    const allParties = new Set([
      ...Object.keys(constituencySeats),
      ...Object.keys(listSeats),
    ]);

    const mandates = [];

    for (const party of allParties) {
      const oevk = constituencySeats[party] ?? 0;
      const list = listSeats[party] ?? 0;

      mandates.push({
        party,
        constituencySeats: oevk,
        listSeats: list,
        totalSeats: oevk + list,
      });
    }

    return {
      mandates,
      constituencySeats,
      listSeats,
      compensation,
    };
  }
}
