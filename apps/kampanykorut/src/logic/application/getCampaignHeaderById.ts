import { fetchJSON } from "./fetchJSON";
import type { CampaignHeader } from "./hooks/useGetCampaigns";

export async function getCampaignHeaderById(
  id: string,
): Promise<CampaignHeader | undefined> {
  const campaigns = await fetchJSON<CampaignHeader[]>("campaigns");
  return campaigns?.find((campaign) => campaign.id === id);
}
