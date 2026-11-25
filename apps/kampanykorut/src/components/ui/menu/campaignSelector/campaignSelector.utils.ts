import type { CampaignHeader } from "@logic/application";

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
