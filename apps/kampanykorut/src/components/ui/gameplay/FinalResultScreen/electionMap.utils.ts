import { CampaignConfig } from "@/shared/types";

export type VotePercentage = {
  votes?: number;
  percentage: number;
  isWinner?: boolean;
  candidates?: string[];
};

export function calculateVotePercentages(
  votes?: Record<string, number | undefined>,
  candidates?: Record<string, string[] | undefined>,
): Record<string, VotePercentage> | undefined {
  if (!votes) {
    return;
  }

  const totalVotes = Object.values(votes).reduce(
    (sum, value) => (sum ?? 0) + (value ?? 0),
    0,
  );

  const maxVotes = Math.max(...Object.values(votes).map((v) => v ?? 0));

  return Object.fromEntries(
    Object.entries(votes).map(([party, voteCount]) => [
      party,
      {
        votes: voteCount ?? 0,
        percentage: Number(
          (((voteCount ?? 0) / (totalVotes ?? 0)) * 100).toFixed(2),
        ),
        isWinner: (voteCount ?? 0) === maxVotes,
        candidates: candidates?.[party],
      },
    ]),
  );
}

export interface Candidate {
  name: string;
  party: string;
  votes: number;
  percentage: number;
  isWinner: boolean;
}

export function getCandidates(
  candidates: Record<string, string[] | undefined> | undefined,
  votePercentage: Record<string, VotePercentage> | undefined,
): Candidate[] {
  if (!candidates || !votePercentage) {
    return [];
  }

  return Object.entries(candidates)
    .flatMap(([party, candidateList]) =>
      (candidateList ?? []).map((candidate) => ({
        name: candidate,
        party,
        votes: votePercentage[party]?.votes ?? 0,
        percentage: votePercentage[party]?.percentage ?? 0,
        isWinner: votePercentage[party]?.isWinner ?? false,
      })),
    )
    .sort((a, b) => b.votes - a.votes);
}

export function getPartyById(id: string, config: CampaignConfig) {
  const parties = config.electionConfig.parties;
  return parties.find((party) => party.id === id);
}
