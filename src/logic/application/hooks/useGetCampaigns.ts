import { useEffect, useState } from "react";
import { getDataPath } from "../PathResolver";

export interface CampaignHeader {
  id: string;
  label: string;
  description: string;
  campaignBanner: string;
}

export function useGetCampaigns() {
  const pathToCampaigns = getDataPath("campaigns");
  const [campaigns, setCampaigns] = useState<CampaignHeader[]>([]);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const campaignsData =
          await loadJsonCached<CampaignHeader[]>(pathToCampaigns);
        setCampaigns(campaignsData);
      } catch (error) {
        console.error("Error loading campaigns:", error);
      }
    };

    loadCampaigns();
  }, [pathToCampaigns]);

  return campaigns;
}

const cache = new Map<string, unknown>();

async function loadJsonCached<T>(path: string): Promise<T> {
  if (cache.has(path)) {
    return cache.get(path) as T;
  }

  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load JSON: ${path}`);
  }

  const data = await res.json();
  cache.set(path, data);

  return data;
}
