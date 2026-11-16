import { data, type LoaderFunctionArgs } from "react-router";
import { container } from "tsyringe";
import { StorageEngine } from "@/logic/application";
import type { ElectionConfig } from "@/shared/types/configs/election-config";
import { fetchJSON } from "../../logic/application/fetchJSON";
import { getCampaignHeaderById } from "../../logic/application/getCampaignHeaderById";
import { buildCampaignPageData } from "../ui/campaignPage/campaignPage.data";

export async function campaignPageLoader({ params }: LoaderFunctionArgs) {
  const campaign = params.campaignId
    ? await getCampaignHeaderById(params.campaignId)
    : undefined;
  const debugMode =
    container.resolve(StorageEngine).getItem("debugMode", "localStorage") ===
    "true";
  if (!campaign || (!campaign.isPublished && !debugMode)) {
    throw data(null, { status: 404 });
  }
  const electionConfig = await fetchJSON<ElectionConfig>(
    "electionConfig",
    campaign.route,
  );
  const pageData = buildCampaignPageData(
    campaign,
    electionConfig,
    params.sideId,
  );
  if (!pageData) {
    throw data(null, { status: 404 });
  }
  return pageData;
}
