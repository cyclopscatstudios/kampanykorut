import type { PartyName } from "../../types/color";

export type DistrictResult = {
  winner: string;
  maxVotes: number;
} & Result;

export type District = {
  maz: string;
  evk: string;
  centrum: string;
  poligon: string;
};

export type Result = {
  megyekod: number;
  megye: string;
  oevk: number;
  telepules: string;
  valasztopolgar: number;
  partok: Partial<Record<PartyName, number>>;
  jeloltek: Partial<Record<PartyName, string[]>>;
};

export function getWinnerResults(
  d: District,
  result: Result[],
): DistrictResult {
  const results = result.find(
    (er) => er.megyekod === Number(d.maz) && er.oevk === Number(d.evk),
  );
  const [winner, maxVotes] = Object.entries(results?.partok ?? {}).reduce(
    (max, current) => (current[1] > max[1] ? current : max),
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
