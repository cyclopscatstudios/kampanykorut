import { Text } from "../../../../../../../shared/ui/Text";
import { Heading } from "../../Heading";
import type { Campaign } from "./types";
import { CAMPAIGN_TEASER_LENGTH, truncate } from "./utils";

interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
}

export function CampaignCard({ campaign, onSelect }: CampaignCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(campaign)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(campaign);
        }
      }}
      className="flex cursor-pointer flex-col overflow-hidden rounded-md border border-blue-500/30 bg-[rgba(148,163,184,0.05)] text-left transition hover:border-blue-400/60 hover:bg-[rgba(148,163,184,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      <img
        src={`/images/${campaign.route}/${campaign.campaignBanner}`}
        alt={campaign.label}
        className="h-auto w-full object-contain"
      />
      <div className="flex flex-col gap-2 p-5">
        <Heading level={3} color="white">
          {campaign.label}
        </Heading>
        <Text as="p" color="gray" size="sm">
          {truncate(campaign.description, CAMPAIGN_TEASER_LENGTH)}
        </Text>
      </div>
    </article>
  );
}
