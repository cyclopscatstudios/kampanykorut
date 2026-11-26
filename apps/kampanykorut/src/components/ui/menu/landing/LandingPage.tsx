import {
  isCampaignListed,
  useGetCampaigns,
  useSettings,
} from "@logic/application";
import { track } from "@logic/infra/posthog/track";
import { useNavigate } from "react-router-dom";
import { useQuickStart } from "../../../../hooks/useQuickStart";
import { NewsSection } from "../../news/NewsSection";
import { CampaignsSection } from "./CampaignsSection";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";

export function LandingPage() {
  const navigate = useNavigate();
  // Subscribing here forces the whole landing tree to re-render on language
  // change, since the texts below are read via `t()` at render time.
  useSettings();
  const campaigns = useGetCampaigns().filter((campaign) =>
    isCampaignListed(campaign),
  );

  const newsBelowCampaigns =
    import.meta.env.VITE_NEWS_PLACEMENT === "below-campaigns";

  const quickStart = useQuickStart();

  const startQuickGame = () => {
    track("landing_exited", { target: "quick_start" });
    quickStart();
  };

  const goToCampaignSelector = () => {
    track("landing_exited", { target: "campaign_selector" });
    navigate("/new-game/classic");
  };

  const trackCampaignOpened = () =>
    track("landing_exited", { target: "campaign_page" });

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-100">
      <LandingHero
        onQuickStart={startQuickGame}
        onChooseCampaign={goToCampaignSelector}
      />
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
