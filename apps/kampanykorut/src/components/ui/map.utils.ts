import { CandidateListData, District, DistrictPoligon } from "@/shared/types";
import { PartyName } from "../../../../../shared/types/color";

export function resultsKey(megyekod: number, oevk: number) {
  return `${megyekod}-${oevk}`;
}

export function buildResultsIndex(result: CandidateListData[]) {
  const index = new Map<string, CandidateListData>();
  for (const er of result) {
    index.set(resultsKey(er.megyekod, er.oevk), er);
  }
  return index;
}

export function getWinnerResultsByDistrictPoligon(
  d: DistrictPoligon,
  resultIndex: Map<string, CandidateListData>,
) {
  const results = resultIndex.get(resultsKey(Number(d.maz), Number(d.evk)));

  return getWinnerResultByCandidateList(results);
}

export function getWinnerResultByCandidateList(data?: CandidateListData) {
  if (!data) {
    throw new Error("District result not found");
  }

  const entries = Object.entries(data?.partok ?? {}).filter(
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
    ...data,
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
