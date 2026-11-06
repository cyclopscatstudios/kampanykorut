import { useEffect, useState } from "react";
import { createLogger } from "@/shared/logger";
import type { CampaignStatus } from "@/shared/types";
import { fetchJSON } from "../fetchJSON";
import { getDataPath } from "../PathResolver";

export interface CampaignHeader {
  id: string;
  label: string;
  description: string;
  year: number;
  tags: string[];
  route: string;
  campaignBanner: string;
  thinCampaignBanner?: string;
  status: CampaignStatus;
}

const environment = import.meta.env.VITE_ENVIRONMENT;
const isDevBuild =
  import.meta.env.DEV || environment === "dev" || environment === "development";

export function isCampaignListed(
  campaign: Pick<CampaignHeader, "status">,
  debugMode = false,
): boolean {
  if (debugMode) return true;
  if (campaign.status === "published") return true;
  return campaign.status === "candidate" && isDevBuild;
}

const log = createLogger("useGetCampaigns");

export function useGetCampaigns() {
  const pathToCampaigns = getDataPath("campaigns");
  const [campaigns, setCampaigns] = useState<CampaignHeader[]>([]);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const campaignsData = await fetchJSON<CampaignHeader[]>("campaigns");
        setCampaigns(campaignsData);
      } catch (error) {
        log.error("Error loading campaigns:", error);
      }
    };

    loadCampaigns();
  }, [pathToCampaigns]);

  return campaigns;
}
