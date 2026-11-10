import {
  CalculateResults,
  CampaignConfig,
  CandidateListData,
  RegionSeatResult,
} from "@/shared/types";

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
  seats?: number;
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

// A list election names no district candidate, so each party row shows its
// leader and the seats it won in the district's region.
export function getPartyRows(
  votePercentage: Record<string, VotePercentage> | undefined,
  config: CampaignConfig,
  region?: RegionSeatResult,
): Candidate[] {
  if (!votePercentage) {
    return [];
  }
  return Object.entries(votePercentage)
    .filter(([party, result]) => party !== "_other" && (result.votes ?? 0) > 0)
    .map(([party, result]) => {
      const info = getPartyById(party, config);
      return {
        name: info?.leader ?? info?.name ?? party,
        party,
        votes: result.votes ?? 0,
        percentage: result.percentage,
        isWinner: result.isWinner ?? false,
        seats: region ? (region.allocation[party] ?? 0) : undefined,
      };
    })
    .sort((a, b) => b.votes - a.votes);
}

export function getDistrictRegion(
  district: Pick<CandidateListData, "megyekod"> | null,
  config: CampaignConfig,
  results?: Pick<CalculateResults, "regions">,
): RegionSeatResult | undefined {
  if (!district) {
    return undefined;
  }
  const election = config.electionConfig.election;
  const regions = election && "regions" in election ? election.regions : [];
  const region = regions.find((r) => r.megyekods.includes(district.megyekod));
  return results?.regions?.find((r) => r.id === region?.id);
}

export function getResultTitle(
  district: Pick<CandidateListData, "megye" | "oevk" | "telepules">,
): string {
  return district.telepules === district.megye
    ? district.megye
    : `${district.megye} ${district.oevk}`;
}

export function getPartyById(id: string, config: CampaignConfig) {
  const parties = config.electionConfig.parties;
  return parties.find((party) => party.id === id);
}
