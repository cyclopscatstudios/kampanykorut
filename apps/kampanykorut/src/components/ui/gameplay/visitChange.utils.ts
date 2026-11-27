import { CandidateListData, District } from "@shared/types";
import { toShares } from "./districtEstimate.utils";

export const CHANGE_THRESHOLD = 0.5;

type Shares = Record<string, number>;

export type PollSnapshot = {
  districts: Record<string, Shares>;
  national: Shares;
};

export type DistrictChange = {
  deltas: Shares;
  before: Shares;
  after: Shares;
};

export type VisitChange = {
  districts: Record<string, DistrictChange>;
  national: Shares;
  visited?: string;
};

export type VisitChangeView = {
  change: VisitChange;
  visited: District | null;
  partyId?: string;
  isCityMap?: boolean;
  isSummaryOpen: boolean;
  onCloseSummary: () => void;
};

export type VisitSummary = {
  national?: number;
  visited?: { key: string; before: number; after: number };
  gained: number;
  lost: number;
};

export function districtKey(district: { megyekod: number; oevk: number }) {
  return `${district.megyekod}-${district.oevk}`;
}

export function buildSnapshot(
  candidateListData: CandidateListData[],
  nationalShares: Record<string, number> = {},
): PollSnapshot {
  const districts: Record<string, Shares> = {};
  for (const district of candidateListData) {
    districts[districtKey(district)] = Object.fromEntries(
      toShares(district.partok),
    );
  }
  const national = Object.fromEntries(
    Object.entries(nationalShares)
      .filter(([partyId]) => partyId !== "_total")
      .map(([partyId, share]) => [partyId, share * 100]),
  );
  return { districts, national };
}

export function diffSnapshots(
  before: PollSnapshot,
  after: PollSnapshot,
  visited?: string,
): VisitChange {
  const districts: Record<string, DistrictChange> = {};
  for (const [key, afterShares] of Object.entries(after.districts)) {
    const beforeShares = before.districts[key];
    if (!beforeShares) continue;
    districts[key] = {
      deltas: diffShares(beforeShares, afterShares),
      before: beforeShares,
      after: afterShares,
    };
  }
  return {
    districts,
    national: diffShares(before.national, after.national),
    visited,
  };
}

export function resolvePlayerKey(
  change: VisitChange,
  partyId?: string,
  candidateId?: string,
) {
  if (!candidateId) return partyId;
  // A district may omit a zero-vote candidate, so look across all districts.
  const hasKey = (key: string) =>
    Object.values(change.districts).some(
      (district) => key in district.after || key in district.before,
    );
  if (hasKey(candidateId) && !(partyId && hasKey(partyId))) return candidateId;
  return partyId;
}

export type MapChange = { delta: number; standout: boolean };

export function getMapChanges(change: VisitChange, partyId?: string) {
  const standout = getStandoutDeltas(change, partyId);
  const changes: Record<string, MapChange> = {};
  for (const [key, delta] of Object.entries(
    getVisibleDeltas(change, partyId),
  )) {
    changes[key] = { delta, standout: key in standout };
  }
  return changes;
}

export function getVisibleDeltas(change: VisitChange, partyId?: string) {
  if (!partyId) return {};
  const deltas: Record<string, number> = {};
  for (const [key, district] of Object.entries(change.districts)) {
    const delta = district.deltas[partyId];
    if (isVisibleDelta(delta)) deltas[key] = delta;
  }
  return deltas;
}

export function getStandoutDeltas(change: VisitChange, partyId?: string) {
  if (!partyId) return {};
  const national = change.national[partyId] ?? 0;
  const deltas: Record<string, number> = {};
  for (const [key, district] of Object.entries(change.districts)) {
    const delta = district.deltas[partyId];
    if (delta === undefined) continue;
    const flipped =
      (leaderOf(district.before) === partyId) !==
      (leaderOf(district.after) === partyId);
    const standsOut = Math.abs(delta - national) >= CHANGE_THRESHOLD;
    if ((flipped || standsOut) && Math.abs(delta) >= CHANGE_THRESHOLD) {
      deltas[key] = delta;
    }
  }
  return deltas;
}

export function summarizeChange(
  change: VisitChange,
  partyId?: string,
): VisitSummary {
  const summary: VisitSummary = {
    gained: 0,
    lost: 0,
  };
  if (!partyId) return summary;

  for (const district of Object.values(change.districts)) {
    const wasLeading = leaderOf(district.before) === partyId;
    const isLeading = leaderOf(district.after) === partyId;
    if (!wasLeading && isLeading) summary.gained += 1;
    if (wasLeading && !isLeading) summary.lost += 1;
  }

  const nationalDelta = change.national[partyId];
  if (nationalDelta !== undefined) summary.national = nationalDelta;

  const visited = change.visited && change.districts[change.visited];
  if (change.visited && visited) {
    summary.visited = {
      key: change.visited,
      before: visited.before[partyId] ?? 0,
      after: visited.after[partyId] ?? 0,
    };
  }
  return summary;
}

export function isVisibleDelta(delta?: number): delta is number {
  return delta !== undefined && Math.abs(delta) >= CHANGE_THRESHOLD;
}

function diffShares(before: Shares, after: Shares): Shares {
  const deltas: Shares = {};
  for (const partyId of new Set([
    ...Object.keys(before),
    ...Object.keys(after),
  ])) {
    deltas[partyId] = (after[partyId] ?? 0) - (before[partyId] ?? 0);
  }
  return deltas;
}

function leaderOf(shares: Shares) {
  let leader: string | undefined;
  let best = -Infinity;
  for (const [partyId, share] of Object.entries(shares)) {
    if (partyId !== "_other" && share > best) {
      best = share;
      leader = partyId;
    }
  }
  return leader;
}
