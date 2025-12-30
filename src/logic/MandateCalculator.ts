import type { PartyId } from "./ElectionEngine";

export type PartyVotes = Record<PartyId, number>;

export interface CombinedOevk {
  megyekod: number;
  megye: string;
  oevk: number;

  constituencyVotes: PartyVotes;
  listVotes: PartyVotes;
  candidates?: Record<PartyId, string[]>;
}

export interface ElectionConfig {
  listSeats: number;
  thresholdPercent: number;
}

export class MandateCalculator {
  constructor(private config: ElectionConfig) {}

  // Single-member district seats
  calculateConstituencySeats(data: CombinedOevk[]) {
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

  // Fragment votes + winner compensation
  calculateCompensation(data: CombinedOevk[]) {
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

      // total votes of losing candidates
      for (let i = 1; i < sorted.length; i++) {
        const [party, votes] = sorted[i];
        losingVotes[party] = (losingVotes[party] ?? 0) + votes;
      }

      // winner compensation
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
  allocateListSeats(listVotes: PartyVotes, compensation: PartyVotes) {
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
