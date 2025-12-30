import type { OevkResult } from "../../logic/ResultModifier";

export type DistrictResult = {
  winner: string;
  maxVotes?: number;
} & OevkResult;

export type District = {
  maz: string;
  evk: string;
  centrum: string;
  poligon: string;
};

export function getWinnerResults(d: District, result: OevkResult[]) {
  const results = result.find(
    (er) => er.megyekod === Number(d.maz) && er.oevk === Number(d.evk),
  );
  const entries = Object.entries(results?.partok ?? {}).filter(
    (entry): entry is [string, number] => typeof entry[1] === "number",
  );

  const [winner, maxVotes] = entries.reduce((max, current) =>
    current[1] > max[1] ? current : max,
  );

  if (!results) {
    throw new Error("District result not found");
  }
  return {
    winner,
    maxVotes,
    ...results,
  };
}
