import type { CandidateListData } from "@/logic/domain";
import type { PartyName } from "../../types/color";

export type District = {
  winner: string;
  maxVotes?: number;
} & CandidateListData;

export type DistrictPoligon = {
  maz: string;
  evk: string;
  centrum: string;
  poligon: string;
};

export function getWinnerResultsByList(
  d: DistrictPoligon,
  result: CandidateListData[],
) {
  const results = result.find(
    (er) => er.megyekod === Number(d.maz) && er.oevk === Number(d.evk),
  );

  if (!results) {
    throw new Error("District result not found");
  }

  const entries = Object.entries(results?.partok ?? {}).filter(
    (entry): entry is [string, number] => typeof entry[1] === "number",
  );

  const [winner, maxVotes] = entries.reduce((max, current) =>
    current[1] > max[1] ? current : max,
  );

  const totalVotes = entries.reduce((sum, [, votes]) => sum + votes, 0);

  const sorted = [...entries].sort((a, b) => b[1] - a[1]);

  const [first, second] = sorted;

  const firstVotes = first?.[1] ?? 0;
  const secondVotes = second?.[1] ?? 0;

  const voteDiff = firstVotes - secondVotes;

  const diffPercentage = firstVotes > 0 ? (voteDiff / firstVotes) * 100 : 0;

  return {
    winner: winner as PartyName,
    totalVotes,
    maxVotes,
    voteDiff,
    diffPercentage,
    ...results,
  };
}

export function getWinnerResultByDistrict(district?: District | null) {
  if (!district) {
    return null;
  }

  const entries = Object.entries(district?.partok ?? {}).filter(
    (entry): entry is [string, number] => typeof entry[1] === "number",
  );

  if (!entries) {
    return null;
  }

  const [winner, maxVotes] = entries.reduce((max, current) =>
    current[1] > max[1] ? current : max,
  );

  const totalVotes = entries.reduce((sum, [, votes]) => sum + votes, 0);

  const sorted = [...entries].sort((a, b) => b[1] - a[1]);

  const [first, second] = sorted;

  const firstVotes = first?.[1] ?? 0;
  const secondVotes = second?.[1] ?? 0;

  const voteDiff = firstVotes - secondVotes;

  const diffPercentage = firstVotes > 0 ? (voteDiff / firstVotes) * 100 : 0;

  return {
    winner: winner as PartyName,
    totalVotes,
    maxVotes,
    voteDiff,
    diffPercentage,
  };
}
