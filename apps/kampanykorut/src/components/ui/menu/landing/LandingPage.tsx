import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetCampaigns, useSettings } from "@/logic/application";
import { AnalyticsEvent, track } from "../../../../logic/infra/posthog/track";
import { CampaignDetailsDialog } from "./CampaignDetailsDialog";
import { CampaignsSection } from "./CampaignsSection";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";
import type { Campaign } from "./types";

export function LandingPage() {
  const navigate = useNavigate();
  // Subscribing here forces the whole landing tree to re-render on language
  // change, since the texts below are read via `t()` at render time.
  useSettings();
  const campaigns = useGetCampaigns().filter(
    (campaign) => campaign.isPublished,
  );
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );

  const goToMenu = () => {
    track(AnalyticsEvent.LEAVE_LANDING_PAGE, {});
    navigate("/menu");
  };

  const goToSideSelector = (campaign: Campaign) => {
    track(AnalyticsEvent.LEAVE_LANDING_PAGE, {});
    navigate(`/new-game/classic/sides/${campaign.id}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-100">
      <LandingHero onStart={goToMenu} />
      <CampaignsSection
        campaigns={campaigns}
        onSelectCampaign={setSelectedCampaign}
      />
      <LandingFooter />
      <CampaignDetailsDialog
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        onStartCampaign={goToSideSelector}
      />
    </div>
  );
}
