import { useEffect, useState } from "react";
import { getDataPath } from "../PathResolver";
import { fetchJSON } from "../fetchJSON";

export interface CampaignHeader {
  id: string;
  label: string;
  description: string;
  route: string;
  campaignBanner: string;
}

export function useGetCampaigns() {
  const pathToCampaigns = getDataPath("campaigns");
  const [campaigns, setCampaigns] = useState<CampaignHeader[]>([]);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const campaignsData = await fetchJSON<CampaignHeader[]>("campaigns");
        setCampaigns(campaignsData);
      } catch (error) {
        console.error("Error loading campaigns:", error);
      }
    };

    loadCampaigns();
  }, [pathToCampaigns]);

  return campaigns;
}
