import { CampaignConfig } from "@/shared/types";

export const cache = new Map<string, Promise<CampaignConfig>>();

export function clearCampaignConfigCache(): void {
  cache.clear();
}
