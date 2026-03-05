import type { DistrictResult } from "../../components/ui/map.utils";
import type {
  CandidateListData,
  Shares,
} from "./ResultTransformer/VoteShareTransformer.types";

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

export function calcPercentages(
  totals: Record<string, number>,
): Shares & { _total: number } {
  const sum = Object.values(totals).reduce((a, b) => a + b, 0);
  const result: Shares & { _total: number } = {} as any;

  if (!sum) {
    result._total = 0;
    return result;
  }

  for (const [party, votes] of Object.entries(totals)) {
    result[party] = votes / sum;
  }

  result._total = Object.values(result)
    .filter((v) => typeof v === "number")
    .reduce((a, b) => a + b, 0);

  return result;
}

export function getCapacity(
  districts: CandidateListData[],
  oevk: number,
  megyekod: number,
) {
  return districts.find(
    (district) => district.megyekod === megyekod && district.oevk === oevk,
  );
}
