import { t } from "i18next";
import type { ElectionConfig } from "@/shared/types/configs/election-config";
import type { CampaignHeader } from "../../../logic/application/hooks/useGetCampaigns";
import { truncate } from "../menu/landing/utils";

export const CAMPAIGN_PAGE_PATH = "/kampany";
export const SITE_ORIGIN = "https://kampanykorut.hu";
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
const META_DESCRIPTION_LENGTH = 160;

export interface CampaignPageSide {
  id: string;
  label: string;
  description?: string;
  candidate: { id: string; label: string; description?: string };
  partyLogo?: string;
  portrait?: string;
}

export interface CampaignPageData {
  campaign: CampaignHeader;
  sides: CampaignPageSide[];
  side?: CampaignPageSide;
}

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  image: string;
}

export function campaignPagePath(campaignId: string, sideId?: string) {
  return sideId
    ? `${CAMPAIGN_PAGE_PATH}/${campaignId}/${sideId}`
    : `${CAMPAIGN_PAGE_PATH}/${campaignId}`;
}

export function ogImagePath(campaignId: string, sideId?: string) {
  return sideId ? `/og/${campaignId}/${sideId}.jpg` : `/og/${campaignId}.jpg`;
}

export function campaignBannerPath(campaign: CampaignHeader) {
  return `/images/${campaign.route}/${campaign.campaignBanner}`;
}

export function sideSelectorPath(campaignId: string, sideId?: string) {
  const base = `/new-game/classic/sides/${campaignId}`;
  return sideId ? `${base}?side=${encodeURIComponent(sideId)}` : base;
}

export function getPlayableSides(
  electionConfig: Pick<ElectionConfig, "playableSides" | "electionAssets">,
): CampaignPageSide[] {
  return electionConfig.playableSides.flatMap((side) => {
    const candidate = side.mainCandidates.find((c) =>
      side.playableCandidates?.includes(c.id),
    );
    if (!candidate) return [];
    const assets = electionConfig.electionAssets.find((a) => a.id === side.id);
    return [
      {
        id: side.id,
        label: side.label,
        description: side.description,
        candidate: {
          id: candidate.id,
          label: candidate.label,
          description: candidate.description,
        },
        partyLogo: assets?.party_logo,
        portrait: assets?.candidateAssets.find((a) => a.id === candidate.id)
          ?.portrait,
      },
    ];
  });
}

export function buildCampaignPageData(
  campaign: CampaignHeader,
  electionConfig: Pick<ElectionConfig, "playableSides" | "electionAssets">,
  sideId?: string,
): CampaignPageData | null {
  const sides = getPlayableSides(electionConfig);
  if (!sideId) return { campaign, sides };
  const side = sides.find((s) => s.id === sideId);
  return side ? { campaign, sides, side } : null;
}

export function buildCampaignPageMeta({
  campaign,
  side,
}: CampaignPageData): PageMeta {
  if (!side) {
    return {
      title: t("campaignPage.meta.campaignTitle", { campaign: campaign.label }),
      description: truncate(campaign.description, META_DESCRIPTION_LENGTH),
      path: campaignPagePath(campaign.id),
      image: ogImagePath(campaign.id),
    };
  }
  const about = side.candidate.description ?? side.description ?? "";
  return {
    title: t("campaignPage.meta.sideTitle", {
      candidate: side.candidate.label,
      campaign: campaign.label,
    }),
    description: truncate(
      `${t("campaignPage.meta.sideDescription", {
        candidate: side.candidate.label,
        campaign: campaign.label,
      })} ${about}`.trim(),
      META_DESCRIPTION_LENGTH,
    ),
    path: campaignPagePath(campaign.id, side.id),
    image: ogImagePath(campaign.id, side.id),
  };
}

export type MetaEntry =
  | { kind: "meta"; attr: "name" | "property"; key: string; content: string }
  | { kind: "canonical"; href: string };

export function buildMetaEntries(
  meta: PageMeta,
  origin = SITE_ORIGIN,
): MetaEntry[] {
  const url = `${origin}${meta.path}`;
  const image = `${origin}${meta.image}`;
  const entry = (
    attr: "name" | "property",
    key: string,
    content: string,
  ): MetaEntry => ({ kind: "meta", attr, key, content });
  return [
    entry("name", "description", meta.description),
    { kind: "canonical", href: url },
    entry("property", "og:type", "website"),
    entry("property", "og:url", url),
    entry("property", "og:title", meta.title),
    entry("property", "og:description", meta.description),
    entry("property", "og:image", image),
    entry("property", "og:image:width", String(OG_IMAGE_SIZE.width)),
    entry("property", "og:image:height", String(OG_IMAGE_SIZE.height)),
    entry("name", "twitter:card", "summary_large_image"),
    entry("name", "twitter:title", meta.title),
    entry("name", "twitter:description", meta.description),
    entry("name", "twitter:image", image),
  ];
}
