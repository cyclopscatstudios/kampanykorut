import { useSettings } from "@logic/application";
import { track } from "@logic/infra/posthog/track";
import { useMemo } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { NewsPageLayout } from "../news/NewsPageLayout";
import {
  buildCampaignPageMeta,
  type CampaignPageData,
  sideSelectorPath,
} from "./campaignPage.data";
import { CampaignPageView } from "./CampaignPageView";
import { useDocumentMeta } from "./useDocumentMeta";

export function CampaignPage() {
  const data = useLoaderData() as CampaignPageData;
  const navigate = useNavigate();
  const { settings } = useSettings();
  const meta = useMemo(
    () => buildCampaignPageMeta(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, settings.language],
  );
  useDocumentMeta(meta);

  const start = (sideId?: string) => {
    track("campaign_page_start_clicked", {
      campaign_id: data.campaign.id,
      side_id: sideId,
    });
    navigate(sideSelectorPath(data.campaign.id, sideId));
  };

  const back = () => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <NewsPageLayout>
      <CampaignPageView data={data} onStart={start} onBack={back} />
    </NewsPageLayout>
  );
}
