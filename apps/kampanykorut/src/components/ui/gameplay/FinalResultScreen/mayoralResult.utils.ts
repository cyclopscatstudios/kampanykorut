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

export function formatVotes(votes: number) {
  return votes.toLocaleString("hu-HU");
}

export function formatShare(share: number) {
  return `${(share * 100).toFixed(2)}%`;
}
