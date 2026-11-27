import { Text } from "@shared/ui/Text";
import { Link } from "react-router-dom";
import { campaignPagePath } from "../../campaignPage/campaignPage.data";
import { Heading } from "../../Heading";
import { CampaignChips, NewBadge } from "../campaignSelector/CampaignChips";
import { isNewCampaign } from "../campaignSelector/campaignSelector.utils";
import type { Campaign } from "./types";
import { CAMPAIGN_TEASER_LENGTH, truncate } from "./utils";

interface CampaignCardProps {
  campaign: Campaign;
  onOpen: (campaign: Campaign) => void;
}

export function CampaignCard({ campaign, onOpen }: CampaignCardProps) {
  return (
    <Link
      to={campaignPagePath(campaign.id)}
      onClick={() => onOpen(campaign)}
      className="flex flex-col overflow-hidden rounded-md border border-blue-500/30 bg-[rgba(148,163,184,0.05)] text-left transition hover:border-blue-400/60 hover:bg-[rgba(148,163,184,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      <img
        src={`/images/${campaign.route}/${campaign.campaignBanner}`}
        alt={campaign.label}
        width={1672}
        height={941}
        loading="lazy"
        decoding="async"
        className="h-auto w-full object-contain"
      />
      <div className="flex flex-col gap-2 p-5">
        <span className="flex items-center gap-2">
          <Heading level={3} color="white">
            {campaign.label}
          </Heading>
          {isNewCampaign(campaign) && <NewBadge />}
        </span>
        <CampaignChips campaign={campaign} />
        <Text as="p" color="gray" size="sm">
          {truncate(campaign.description, CAMPAIGN_TEASER_LENGTH)}
        </Text>
      </div>
    </Link>
  );
}
