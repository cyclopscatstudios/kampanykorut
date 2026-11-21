import {
  CandidateListData,
  PartyListData,
  PartyListVotes,
  SplitPartyEffect,
} from "../../types";

type Votes = Record<string, number | undefined>;

function splitVotes(
  partok: Votes,
  partyId: string,
  shares: Record<string, number>,
): Votes {
  const result = { ...partok };
  let taken = 0;
  for (const source of Object.keys(shares).sort()) {
    const votes = result[source] ?? 0;
    const moved = Math.round(votes * shares[source]);
    if (moved > 0) {
      result[source] = votes - moved;
      taken += moved;
    }
  }
  result[partyId] = (result[partyId] ?? 0) + taken;
  return result;
}

function sharesFor(effect: SplitPartyEffect, megyekod: number) {
  return effect.fromByMegye?.[String(megyekod)] ?? effect.from;
}

export function splitCandidateListData(
  districts: CandidateListData[],
  effect: SplitPartyEffect,
): CandidateListData[] {
  return districts.map((district) => ({
    ...district,
    partok: splitVotes(
      district.partok,
      effect.partyId,
      sharesFor(effect, district.megyekod),
    ),
  }));
}

export function splitPartyListData(
  rows: PartyListData[],
  effect: SplitPartyEffect,
): PartyListData[] {
  return rows.map((row) => ({
    ...row,
    partok: splitVotes(
      row.partok,
      effect.partyId,
      sharesFor(effect, row.megyekod),
    ),
  }));
}

export function splitPartyListVotes(
  votes: PartyListVotes,
  effect: SplitPartyEffect,
): PartyListVotes {
  return splitVotes(votes, effect.partyId, effect.from) as PartyListVotes;
}
