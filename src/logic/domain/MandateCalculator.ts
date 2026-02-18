import { injectable } from "tsyringe";
import { createLogger } from "../logger";
import type {
  ElectionConfig,
  CalculateResults,
  PartyVotes,
  CombinedOevk,
  PartyVotesRaw,
  CandidateMapRaw,
  CandidateMap,
  PartyId,
} from "./MandateCalculator.types";
import type {
  CandidateListData,
  PartyListData,
  Shares,
} from "./ResultTransformer/PipelineTransform.types";
import { calcPercentages } from "./ResultModifier.utils";

const log = createLogger("MandateCalculator");

@injectable()
export class MandateCalculator {
  constructor(private config: ElectionConfig) {}

  calculate(
    districtCandidateData?: CandidateListData[],
    districtPartyData?: PartyListData[],
  ): CalculateResults | undefined {
    if (!districtCandidateData || !districtPartyData) {
      log.error("Missing input data for mandate calculation");
      return undefined;
    }

    const merged = this.merge(districtCandidateData, districtPartyData);

    const constituencySeats = this.calculateSeats(merged);
    const compensation = this.calculateCompensation(merged);

    const listTotals: PartyVotes = {};
    for (const row of merged) {
      for (const [party, votes] of Object.entries(row.listVotes)) {
        listTotals[party] = (listTotals[party] ?? 0) + votes;
      }
    }

    const listSeats = this.allocateListSeats(listTotals, compensation.total);

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

    const totals = this.sumPartyTotals(districtCandidateData);
    const percentages = this.calculatePercentages(totals);

    return {
      totals,
      mandates,
      constituencySeats,
      listSeats,
      compensation,
      percentages,
    };
  }

  public sumPartyTotals(
    districts: CandidateListData[],
  ): Record<string, number> {
    const totals: Record<string, number> = {};

    for (const d of districts) {
      for (const [party, votes] of Object.entries(d.partok)) {
        totals[party] = (totals[party] ?? 0) + (votes ?? 0);
      }
    }

    return totals;
  }

  public calculatePercentages(totals: Record<string, number>): Shares {
    return calcPercentages(totals);
  }

  private merge(
    updatedCandidateData: CandidateListData[],
    updatedPartyData: PartyListData[],
  ) {
    const map = new Map<string, CombinedOevk>();

    for (const c of updatedCandidateData) {
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

    for (const l of updatedPartyData) {
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

  private cleanCandidates(input?: CandidateMapRaw) {
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

  private calculateSeats(data: CombinedOevk[]) {
    const result: Record<PartyId, number> = {};

    for (const oevk of data) {
      const entries = Object.entries(oevk.constituencyVotes);
      if (!entries.length) {
        continue;
      }

      const [winner] = entries.sort((a, b) => b[1] - a[1]);
      result[winner[0]] = (result[winner[0]] ?? 0) + 1;
    }

    return result;
  }

  private calculateCompensation(data: CombinedOevk[]) {
    const losingVotes: PartyVotes = {};
    const winnerCompensation: PartyVotes = {};

    for (const oevk of data) {
      const sorted = Object.entries(oevk.constituencyVotes).sort(
        (a, b) => b[1] - a[1],
      );

      if (sorted.length === 0) {
        continue;
      }

      const [winner, winnerVotes] = sorted[0];
      const secondVotes = sorted[1]?.[1] ?? 0;

      for (let i = 1; i < sorted.length; i++) {
        const [party, votes] = sorted[i];
        losingVotes[party] = (losingVotes[party] ?? 0) + votes;
      }

      const excess = winnerVotes - (secondVotes + 1);
      if (excess > 0) {
        winnerCompensation[winner] = (winnerCompensation[winner] ?? 0) + excess;
      }
    }

    const total: PartyVotes = {};
    for (const party of new Set([
      ...Object.keys(losingVotes),
      ...Object.keys(winnerCompensation),
    ])) {
      total[party] =
        (losingVotes[party] ?? 0) + (winnerCompensation[party] ?? 0);
    }

    return {
      losingVotes,
      winnerCompensation,
      total,
    };
  }

  // D'Hondt list seats
  private allocateListSeats(listVotes: PartyVotes, compensation: PartyVotes) {
    const combined: PartyVotes = {};

    for (const party of new Set([
      ...Object.keys(listVotes),
      ...Object.keys(compensation),
    ])) {
      combined[party] = (listVotes[party] ?? 0) + (compensation[party] ?? 0);
    }

    const totalVotes = Object.values(combined).reduce((a, b) => a + b, 0);

    const eligible = Object.entries(combined).filter(
      ([, v]) => (v / totalVotes) * 100 >= this.config.thresholdPercent,
    );

    const quotients: { party: PartyId; value: number }[] = [];

    for (const [party, votes] of eligible) {
      for (let d = 1; d <= this.config.listSeats; d++) {
        quotients.push({ party, value: votes / d });
      }
    }

    quotients.sort((a, b) => b.value - a.value);

    const seats: Record<PartyId, number> = {};
    for (let i = 0; i < this.config.listSeats; i++) {
      const q = quotients[i];
      seats[q.party] = (seats[q.party] ?? 0) + 1;
    }

    return seats;
  }
}
