import { t } from "i18next";
import { Heading } from "../../Heading";
import { CampaignCard } from "./CampaignCard";
import type { Campaign } from "./types";

interface CampaignsSectionProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
}

export function CampaignsSection({
  campaigns,
  onSelectCampaign,
}: CampaignsSectionProps) {
  if (campaigns.length === 0) {
    return null;
  }

  const sortedCampaigns = [...campaigns].sort((a, b) => b.year - a.year);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <Heading level={2} color="white" className="mb-8 text-center">
        {t("landing.campaigns.heading")}
      </Heading>
      <div className="grid gap-6 md:grid-cols-2">
        {sortedCampaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onSelect={onSelectCampaign}
          />
        ))}
      </div>
    </section>
  );
}
