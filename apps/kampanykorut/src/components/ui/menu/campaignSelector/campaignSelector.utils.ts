import type { CampaignHeader } from "@logic/application";
import type { GameMode } from "@shared/types";

export type CampaignSort = "year" | "added";

export const CAMPAIGN_SORTS: CampaignSort[] = ["year", "added"];

const NEW_CAMPAIGN_DAYS = 30;
const DAY_MS = 86_400_000;

export function sortCampaigns(
  campaigns: CampaignHeader[],
  sort: CampaignSort,
): CampaignHeader[] {
  return campaigns.slice().sort((a, b) => {
    if (sort === "added") {
      const byAdded = (b.addedAt ?? "").localeCompare(a.addedAt ?? "");
      if (byAdded !== 0) return byAdded;
    }
    return b.year - a.year;
  });
}

export function isNewCampaign(
  campaign: Pick<CampaignHeader, "addedAt">,
  now: Date = new Date(),
): boolean {
  if (!campaign.addedAt) return false;
  const added = Date.parse(campaign.addedAt);
  if (Number.isNaN(added)) return false;
  const age = now.getTime() - added;
  return age >= 0 && age <= NEW_CAMPAIGN_DAYS * DAY_MS;
}

export function campaignImageUrl(
  campaign: Pick<CampaignHeader, "route">,
  file: string,
): string {
  return `/images/${campaign.route}/${file}`;
}

export function getCampaignGameModes(
  campaign: Pick<CampaignHeader, "gameMode" | "gameModes">,
): GameMode[] {
  return campaign.gameModes?.length ? campaign.gameModes : [campaign.gameMode];
}

export function isDualModeCampaign(
  campaign: Pick<CampaignHeader, "gameMode" | "gameModes">,
): boolean {
  return getCampaignGameModes(campaign).length > 1;
}

export function supportsStrategicMode(
  campaign: Pick<CampaignHeader, "sideGameModes"> | null | undefined,
  partyId?: string,
  candidateId?: string,
): boolean {
  const sides = campaign?.sideGameModes;
  if (!sides || !partyId) return true;
  const candidates = sides[partyId];
  if (!candidates) return true;
  const modes = candidateId
    ? candidates[candidateId]
    : Object.values(candidates).flat();
  return !modes || modes.includes("strategic");
}
