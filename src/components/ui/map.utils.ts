import { partyColors, PartyName } from "../../types/color";
import { type District, type Result } from "../DistrictMap";

export function getWinnerResults(d: District, result: Result[]) {
  const results = result.find(
    (er) => er.megyekod === Number(d.maz) && er.oevk === Number(d.evk),
  );
  const [winner, maxVotes] = Object.entries(results?.partok ?? {}).reduce(
    (max, current) => (current[1] > max[1] ? current : max),
  );
  return {
    winner,
    maxVotes,
    ...results,
  };
}

export function getPartyColor(party: PartyName): string {
  return partyColors[party];
}
