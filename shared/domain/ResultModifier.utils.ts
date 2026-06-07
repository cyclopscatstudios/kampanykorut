import { createLogger } from "../logger/logger";
import { CandidateListData, District } from "@/shared/types";

const log = createLogger("ResultModifierUtils");

export function calculateWinner(result?: District | null) {
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
): Record<string, number> & { _total: number } {
  const sum = Object.values(totals)
    .filter((v) => !Number.isNaN(v))
    .reduce((a, b) => a + b, 0);
  const result: Record<string, number> & { _total: number } = {} as any;

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

  if (result._total > 1 || result._total < 0) {
    log.error("Invalid total percentage", {
      total: result._total,
      percentages: result,
    });
  }

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
