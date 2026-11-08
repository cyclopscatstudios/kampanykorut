import { CalculateResults, Mandate } from "../types";
import { getMajorityThresholds } from "./Majority";

export interface SeatCountRegion {
  id: string;
  name: string;
  seats: number;
  // One entry per seat, grouped by party in the overall seat order.
  dots: string[];
}

export interface SeatCountParty {
  party: string;
  regional: number;
  national: number;
  total: number;
}

export interface SeatCountView {
  regions: SeatCountRegion[];
  parties: SeatCountParty[];
  allSeats: number;
  nationalSeats: number;
  majority: number;
}

export interface MajorityStatus {
  leader?: Mandate;
  majority: number;
  // Seats the leading party still lacks for a majority; 0 when it has one.
  missing: number;
}

function isBallotParty(mandate: Mandate) {
  return !mandate.party.startsWith("_");
}

function bySeats(a: Mandate, b: Mandate) {
  return (
    b.totalSeats - a.totalSeats ||
    (a.party < b.party ? -1 : a.party > b.party ? 1 : 0)
  );
}

export function buildSeatCountView(
  results: Pick<CalculateResults, "mandates" | "regions">,
  allSeats: number,
  nationalSeats: number,
): SeatCountView {
  const ranked = results.mandates.filter(isBallotParty).sort(bySeats);
  const order = ranked.map((m) => m.party);
  return {
    regions: (results.regions ?? []).map((region) => ({
      id: region.id,
      name: region.name,
      seats: region.seats,
      dots: order.flatMap((party) =>
        Array.from({ length: region.allocation[party] ?? 0 }, () => party),
      ),
    })),
    parties: ranked.map((m) => ({
      party: m.party,
      regional: m.constituencySeats,
      national: m.listSeats,
      total: m.totalSeats,
    })),
    allSeats,
    nationalSeats,
    majority: getMajorityThresholds(allSeats).simple,
  };
}

// Seats counted so far while the regions are revealed one by one; once every
// region is in, the national seats are added too.
export function tallyRevealedSeats(
  view: SeatCountView,
  revealedRegions: number,
): Record<string, number> {
  const tally: Record<string, number> = Object.fromEntries(
    view.parties.map((p) => [p.party, 0]),
  );
  for (const region of view.regions.slice(0, revealedRegions)) {
    for (const party of region.dots) {
      tally[party] = (tally[party] ?? 0) + 1;
    }
  }
  if (revealedRegions >= view.regions.length) {
    for (const p of view.parties) {
      tally[p.party] = (tally[p.party] ?? 0) + p.national;
    }
  }
  return tally;
}

export function getMajorityStatus(
  mandates: Mandate[],
  allSeats: number,
): MajorityStatus {
  const leader = mandates.filter(isBallotParty).sort(bySeats)[0];
  const majority = getMajorityThresholds(allSeats).simple;
  return {
    leader,
    majority,
    missing: Math.max(0, majority - (leader?.totalSeats ?? 0)),
  };
}
