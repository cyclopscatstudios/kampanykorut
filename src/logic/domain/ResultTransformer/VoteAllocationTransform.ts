import type { CandidateListData } from "./PipelineTransform.types";

export class VoteAllocationTransform {
  distributeByWeights(weights: number[], total: number): number[] {
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

  applyPartyDistributionWithCapacity(
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
}
