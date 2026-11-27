import "reflect-metadata";
import "../di/container";
import i18n from "@logic/i18n/i18n";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import {
  buildCampaignPageData,
  buildCampaignPageMeta,
  campaignBannerPath,
  type CampaignPageData,
  campaignPagePath,
  ogImagePath,
} from "../components/ui/campaignPage/campaignPage.data";
import { CampaignPageView } from "../components/ui/campaignPage/CampaignPageView";
import { CampaignsSection } from "../components/ui/menu/landing/CampaignsSection";
import { LandingFooter } from "../components/ui/menu/landing/LandingFooter";
import { LandingHero } from "../components/ui/menu/landing/LandingHero";
import type { Campaign } from "../components/ui/menu/landing/types";
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
  return applyMetaToHtml(template, meta, body, origin);
}

const PRE_HYDRATION_LINKS = `<script>(function(){var r=document.querySelector("#root > div");if(!r)return;var m={landingChooseCampaign:"/new-game/classic",landingRandomStart:"/new-game/classic",landingMenu:"/menu"};r.addEventListener("click",function(e){var b=e.target.closest("[data-testid]");var u=b&&m[b.getAttribute("data-testid")];if(u)location.href=u;});})();</script>`;

export async function renderLandingPage(
  template: string,
  campaigns: Campaign[],
) {
  await i18n.changeLanguage("hu");
  const noop = () => {};
  const body = renderToString(
    <StaticRouter location="/">
      <div className="min-h-screen w-full bg-[#0f172a] text-slate-100">
        <LandingHero
          onChooseCampaign={noop}
          onRandomStart={noop}
          onOpenMenu={noop}
        />
        <CampaignsSection campaigns={campaigns} onOpenCampaign={noop} />
        <LandingFooter />
      </div>
    </StaticRouter>,
  );
  return template.replace(
    '<div id="root"></div>',
    `<div id="root">${body}</div>${PRE_HYDRATION_LINKS}`,
  );
}
