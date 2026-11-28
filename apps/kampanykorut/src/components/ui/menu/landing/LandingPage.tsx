import {
  isCampaignListed,
  StateEngine,
  useGetCampaigns,
  useSettings,
} from "@logic/application";
import { NavigationBinder } from "@logic/application/navigation/NavigationBinder";
import { track } from "@logic/infra/posthog/track";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { container } from "tsyringe";
import { useQuickStart } from "../../../../hooks/useQuickStart";
import { loadSession } from "../../gameplay/loadSession";
import { NewsSection } from "../../news/NewsSection";
import { CampaignsSection } from "./CampaignsSection";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";

export function LandingPage() {
  const navigate = useNavigate();
  // Subscribing here forces the whole landing tree to re-render on language
  // change, since the texts below are read via `t()` at render time.
  useSettings();
  const allCampaigns = useGetCampaigns();
  const campaigns = allCampaigns.filter((campaign) =>
    isCampaignListed(campaign),
  );
  const [lastSession] = useState(
    () => container.resolve(StateEngine).getAutoSaveSessions()[0],
  );
  const lastCampaign = allCampaigns.find(
    (campaign) => campaign.id === lastSession?.campaignId,
  );
  const [isStartingRandom, setIsStartingRandom] = useState(false);

  const newsBelowCampaigns =
    import.meta.env.VITE_NEWS_PLACEMENT === "below-campaigns";

  const quickStart = useQuickStart(campaigns);

  const startRandomGame = () => {
    if (isStartingRandom) return;
    track("landing_exited", { target: "random_start" });
    setIsStartingRandom(true);
    quickStart.start().finally(() => setIsStartingRandom(false));
  };

  const goToCampaignSelector = () => {
    track("landing_exited", { target: "campaign_selector" });
    navigate("/new-game/classic", { viewTransition: true });
  };

  const openMenu = () => {
    track("landing_exited", { target: "menu" });
    navigate("/menu");
  };

  const continueLastSession = () => {
    track("landing_exited", { target: "continue" });
    loadSession(lastSession);
  };

  const trackCampaignOpened = () =>
    track("landing_exited", { target: "campaign_page" });

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-100">
      <NavigationBinder />
      <LandingHero
        onChooseCampaign={goToCampaignSelector}
        onRandomStart={startRandomGame}
        onRandomIntent={quickStart.prepare}
        isStartingRandom={isStartingRandom}
        onOpenMenu={openMenu}
        continueInfo={
          lastCampaign && {
            campaign: lastCampaign.label,
            turn: lastSession?.turn ?? 0,
          }
        }
        onContinue={continueLastSession}
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
