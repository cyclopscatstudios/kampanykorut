import type { DistrictResult } from "../components/ui/map.utils";
import type { ConstituencyDataProps } from "./ResultModifier";

export function sumPartyTotals(
  districts: ConstituencyDataProps[],
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const d of districts) {
    for (const [party, votes] of Object.entries(d.partok)) {
      totals[party] = (totals[party] ?? 0) + (votes ?? 0);
    }
  }

  return totals;
}

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
