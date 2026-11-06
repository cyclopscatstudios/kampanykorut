import { getPlayerVoteKey } from "@/shared/domain";
import { CampaignConfig, CampaignState } from "@/shared/types";
import type { CampaignHeader } from "../../../logic/application/hooks/useGetCampaigns";

export interface CampaignBadgeInfo {
  year?: string;
  electionTitle?: string;
  campaignName?: string;
  bannerUrl?: string;
  color?: string;
  partyName?: string;
  partyLogo?: string;
  candidateName?: string;
  candidatePortrait?: string;
}

export function stripYearPrefix(label: string) {
  return label.replace(/^\s*\d{4}\s*:\s*/, "");
}

export function getCampaignBadgeInfo(
  state: CampaignState | undefined,
  config: CampaignConfig | undefined,
  campaign: CampaignHeader | undefined,
): CampaignBadgeInfo {
  const electionConfig = config?.electionConfig;
  const playerSide = state?.playerSide;
  const voteKey = getPlayerVoteKey(electionConfig, playerSide);
  const voteParty = electionConfig?.parties.find((p) => p.id === voteKey);
  const side = electionConfig?.playableSides.find(
    (s) => s.id === playerSide?.partyId,
  );
  const candidate = side?.mainCandidates.find(
    (c) => c.id === playerSide?.candidateId,
  );
  const assets = electionConfig?.electionAssets.find(
    (a) => a.id === playerSide?.partyId,
  );
  const portrait = assets?.candidateAssets.find(
    (a) => a.id === playerSide?.candidateId,
  )?.portrait;
  const bannerFile = campaign?.thinCampaignBanner ?? campaign?.campaignBanner;

  return {
    year: electionConfig?.year,
    electionTitle: electionConfig?.title,
    campaignName: campaign ? stripYearPrefix(campaign.label) : undefined,
    bannerUrl:
      campaign && bannerFile
        ? `/images/${campaign.route}/${bannerFile}`
        : undefined,
    color: voteParty?.color,
    partyName: side?.label ?? voteParty?.name,
    partyLogo: assets?.party_logo,
    candidateName: candidate?.label,
    candidatePortrait: portrait,
  };
}
