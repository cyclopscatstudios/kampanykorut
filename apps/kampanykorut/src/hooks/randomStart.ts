import type { CampaignHeader } from "@logic/application/hooks/useGetCampaigns";
import type { PlayableSide } from "@shared/types";

type Random = () => number;

const pick = <T>(items: T[], random: Random): T | undefined =>
  items[Math.floor(random() * items.length)];

export function pickRandomCampaign(
  campaigns: Pick<CampaignHeader, "id" | "gameMode">[],
  random: Random = Math.random,
) {
  return pick(
    campaigns.filter((campaign) => campaign.gameMode === "classic"),
    random,
  )?.id;
}

export function pickRandomSide(
  playableSides: PlayableSide[],
  random: Random = Math.random,
) {
  const side = pick(
    playableSides.filter((s) => s.playableCandidates?.length),
    random,
  );
  const candidateId = side && pick(side.playableCandidates ?? [], random);
  return side && candidateId ? { partyId: side.id, candidateId } : undefined;
}
