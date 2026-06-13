import { useEffect, useState } from "react";
import { fetchJSON } from "../logic/application/fetchJSON";
import type { CampaignHeader } from "../logic/application/hooks/useGetCampaigns";

export function useCampaignBanner(
  campaignId: string | undefined,
  thin?: boolean,
) {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) {
      return;
    }

    fetchJSON<CampaignHeader[]>("campaigns").then((campaigns) => {
      const match = campaigns?.find((c) => c.id === campaignId);
      const url = `/images/${match?.route}/${thin ? match?.thinCampaignBanner : match?.campaignBanner}`;
      setBannerUrl(url);
    });
  }, [campaignId]);

  return bannerUrl;
}
