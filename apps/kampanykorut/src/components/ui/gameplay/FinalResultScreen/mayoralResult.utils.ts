import {
  CampaignState,
  MayoralDistrictResult,
  MayoralOutcome,
  RawParty,
} from "@/shared/types";

export type MayoralHeadline = "victory" | "defeat" | "deadlock";

export function getMayoralHeadline(
  outcome: MayoralOutcome,
  playerCandidateId: string | undefined,
): MayoralHeadline {
  if (outcome.kind !== "winner") {
    return "deadlock";
  }
  return outcome.candidateId === playerCandidateId ? "victory" : "defeat";
}

export function getWithdrawnCandidates(
  state: Pick<CampaignState, "candidates"> | null | undefined,
  parties: RawParty[],
) {
  const name = (id?: string) =>
    id ? (parties.find((p) => p.id === id)?.name ?? id) : undefined;

  return Object.entries(state?.candidates ?? {})
    .filter(([, candidate]) => candidate.status === "inactive")
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([id, candidate]) => ({
      id,
      name: name(id) ?? id,
      endorsedName: name(candidate.endorsedCandidateId),
    }));
}

export interface MayoralDistrictRow {
  megyekod: number;
  oevk: number;
  label: string;
  leaderId?: string;
  leaderShare?: number;
  marginPoints?: number;
  validVotes: number;
}

export function getMayoralDistrictRows(
  districts: MayoralDistrictResult[],
): MayoralDistrictRow[] {
  return [...districts]
    .sort((a, b) => a.megyekod - b.megyekod || a.oevk - b.oevk)
    .map((district) => {
      const [leader] = district.standings;
      return {
        megyekod: district.megyekod,
        oevk: district.oevk,
        label: district.label,
        leaderId:
          district.outcome.kind === "winner"
            ? district.outcome.candidateId
            : undefined,
        leaderShare: leader?.share,
        marginPoints: district.margin?.percentagePoints,
        validVotes: district.validVotes,
      };
    });
}

export type MayoralDistrictSortKey =
  | "district"
  | "winner"
  | "share"
  | "margin"
  | "validVotes";

export type SortDirection = "asc" | "desc";

export function sortMayoralDistrictRows(
  rows: MayoralDistrictRow[],
  key: MayoralDistrictSortKey,
  direction: SortDirection,
  parties: RawParty[],
): MayoralDistrictRow[] {
  const winnerName = (row: MayoralDistrictRow) =>
    row.leaderId
      ? (parties.find((p) => p.id === row.leaderId)?.name ?? row.leaderId)
      : undefined;
  const value = (row: MayoralDistrictRow): string | number | undefined => {
    switch (key) {
      case "district":
        return row.megyekod * 1000 + row.oevk;
      case "winner":
        return winnerName(row);
      case "share":
        return row.leaderShare;
      case "margin":
        return row.marginPoints;
      case "validVotes":
        return row.validVotes;
    }
  };
  const sign = direction === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    const left = value(a);
    const right = value(b);
    if (left === undefined || right === undefined) {
      return left === right ? 0 : left === undefined ? 1 : -1;
    }
    const diff =
      typeof left === "string" && typeof right === "string"
        ? left.localeCompare(right, "hu")
        : (left as number) - (right as number);
    return diff * sign || a.megyekod - b.megyekod || a.oevk - b.oevk;
  });
}

export function formatVotes(votes: number) {
  return votes.toLocaleString("hu-HU");
}

export function formatShare(share: number) {
  return `${(share * 100).toFixed(2)}%`;
}
