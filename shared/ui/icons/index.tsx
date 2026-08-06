import CampaignIcon from "./campaign.svg?react";
import ClassicIcon from "./classic.svg?react";

export const svgIcons = {
  classic: ClassicIcon,
  campaign: CampaignIcon,
};

export type SvgIconName = keyof typeof svgIcons;
