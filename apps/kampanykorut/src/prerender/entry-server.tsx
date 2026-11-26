import "reflect-metadata";
import "../di/container";
import i18n from "@logic/i18n/i18n";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import {
  buildCampaignJsonLd,
  buildCampaignPageData,
  buildCampaignPageMeta,
  campaignBannerPath,
  type CampaignPageData,
  campaignPagePath,
  ogImagePath,
} from "../components/ui/campaignPage/campaignPage.data";
import { CampaignPageView } from "../components/ui/campaignPage/CampaignPageView";
import { NewsPageLayout } from "../components/ui/news/NewsPageLayout";
import { applyMetaToHtml } from "./applyMetaToHtml";

export {
  buildCampaignPageData,
  campaignBannerPath,
  campaignPagePath,
  ogImagePath,
};

export async function renderCampaignPage(
  template: string,
  data: CampaignPageData,
  origin?: string,
) {
  await i18n.changeLanguage("hu");
  const meta = buildCampaignPageMeta(data);
  const body = renderToString(
    <StaticRouter location={meta.path}>
      <NewsPageLayout>
        <CampaignPageView data={data} onStart={() => {}} onBack={() => {}} />
      </NewsPageLayout>
    </StaticRouter>,
  );
  return applyMetaToHtml(
    template,
    meta,
    body,
    origin,
    buildCampaignJsonLd(data, meta, origin),
  );
}
