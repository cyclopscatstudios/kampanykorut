import { useEffect, useState } from "react";
import { createLogger } from "@/shared/logger";
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
  isPublished?: boolean;
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
