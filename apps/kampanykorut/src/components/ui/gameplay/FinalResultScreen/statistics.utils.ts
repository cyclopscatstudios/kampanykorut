import { CandidateListData } from "@/shared/types";

export interface StatisticResult {
  district: CandidateListData;
  playerParty: string;
  opponentParty: string;
  playerVotes: number;
  opponentVotes: number;
  difference: number;
  percentageDifference: number;
  winnerParty?: string;
}

function getSortedParties(district: CandidateListData) {
  return Object.entries(district.partok).sort(
    (a, b) => (b[1] ?? 0) - (a[1] ?? 0),
  );
}

// lists are sorted by this value, so the displayed order matches the displayed percentages
function getMarginPercentage(playerVotes: number, opponentVotes: number) {
  const total = playerVotes + opponentVotes;
  return total === 0 ? 0 : ((playerVotes - opponentVotes) / total) * 100;
}

export function getLargestVictories(
  districts: CandidateListData[],
  playerParty: string,
): StatisticResult[] {
  return districts
    .map((district) => {
      const sorted = getSortedParties(district);

      const playerVotes = district.partok[playerParty] ?? 0;
      const opponent = sorted.find(([party]) => party !== playerParty);

      const opponentParty = opponent?.[0] ?? "";
      const opponentVotes = opponent?.[1] ?? 0;

      const difference = playerVotes - opponentVotes;

      const percentageDifference = getMarginPercentage(
        playerVotes,
        opponentVotes,
      );

      return {
        district,
        playerParty,
        opponentParty,
        playerVotes,
        opponentVotes,
        difference,
        percentageDifference,
      };
    })
    .filter((r) => r.difference > 0)
    .sort((a, b) => b.percentageDifference - a.percentageDifference);
}

export function getLargestDefeats(
  districts: CandidateListData[],
  playerParty: string,
): StatisticResult[] {
  return districts
    .map((district) => {
      const sorted = getSortedParties(district);

      const winner = sorted[0];

      const opponentParty = winner?.[0] ?? "";
      const opponentVotes = winner?.[1] ?? 0;

      const playerVotes = district.partok[playerParty] ?? 0;

      const difference = opponentVotes - playerVotes;

      const percentageDifference = getMarginPercentage(
        playerVotes,
        opponentVotes,
      );

      return {
        district,
        playerParty,
        opponentParty,
        playerVotes,
        opponentVotes,
        difference,
        percentageDifference,
      };
    })
    .filter((r) => r.opponentParty !== playerParty)
    .sort((a, b) => a.percentageDifference - b.percentageDifference);
}

export function getClosestDistricts(
  districts: CandidateListData[],
  playerParty: string,
) {
  return districts
    .map((district) => {
      const sorted = getSortedParties(district);

      const winner = sorted[0];

      const playerVotes = district.partok[playerParty] ?? 0;

      const opponent = sorted.find(([party]) => party !== playerParty);

      const opponentParty = opponent?.[0] ?? "";
      const opponentVotes = opponent?.[1] ?? 0;

      const difference = Math.abs(playerVotes - opponentVotes);

      const percentageDifference = Math.abs(
        getMarginPercentage(playerVotes, opponentVotes),
      );

      return {
        district,
        playerParty,
        winnerParty: winner?.[0] ?? "",
        winnerVotes: winner?.[1] ?? 0,
        opponentParty,
        playerVotes,
        opponentVotes,
        difference,
        percentageDifference,
      };
    })
    .sort((a, b) => a.percentageDifference - b.percentageDifference);
}
