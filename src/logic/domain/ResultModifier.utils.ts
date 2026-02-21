import type { DistrictResult } from "../../components/ui/map.utils";
import type { Shares } from "./ResultTransformer/VoteShareTransformer.types";

export function calculateWinner(result?: DistrictResult | null) {
  if (!result) {
    return;
  }

  let winner = "";
  let maxVotes = -Infinity;
  let totalVotes = 0;

  for (const [party, votes] of Object.entries(result.partok)) {
    const v = votes ?? 0;

    totalVotes += v;

    if (v > maxVotes) {
      maxVotes = v;
      winner = party;
    }
  }

  return {
    winner,
    maxVotes,
    totalVotes,
  };
}

export function calcPercentages(totals: Record<string, number>): Shares {
  const sum = Object.values(totals).reduce((a, b) => a + b, 0);
  const result: Shares = {};

  for (const [party, votes] of Object.entries(totals)) {
    result[party] = sum ? votes / sum : 0;
  }

  return result;
}
