import { useNavigate } from "react-router-dom";
import { useGetCampaigns, useSettings } from "@/logic/application";
import { track } from "../../../../logic/infra/posthog/track";
import { NewsSection } from "../../news/NewsSection";
import { CampaignsSection } from "./CampaignsSection";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";

export function LandingPage() {
  const navigate = useNavigate();
  // Subscribing here forces the whole landing tree to re-render on language
  // change, since the texts below are read via `t()` at render time.
  useSettings();
  const campaigns = useGetCampaigns().filter(
    (campaign) => campaign.isPublished,
  );

  const newsBelowCampaigns =
    import.meta.env.VITE_NEWS_PLACEMENT === "below-campaigns";

  const goToMenu = () => {
    track("landing_exited", { target: "menu" });
    navigate("/menu");
  };

  const trackCampaignOpened = () =>
    track("landing_exited", { target: "campaign_page" });

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-100">
      <LandingHero onStart={goToMenu} />
      {!newsBelowCampaigns && <NewsSection />}
      <CampaignsSection
        campaigns={campaigns}
        onOpenCampaign={trackCampaignOpened}
      />
      {newsBelowCampaigns && <NewsSection />}
      <LandingFooter />
    </div>
  );
}
