import type { DistrictResult } from "../../components/ui/map.utils";

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
