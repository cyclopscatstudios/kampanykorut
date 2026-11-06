import type { CampaignConfig, CampaignState } from "@/shared/types";
import type { CampaignHeader } from "../../../logic/application/hooks/useGetCampaigns";
import { getCampaignBadgeInfo, stripYearPrefix } from "./campaignBadge.utils";

const config = {
  electionConfig: {
    title: "Budapest – főpolgármester-választás 2024",
    year: "2024",
    election: { type: "mayoral" },
    parties: [{ id: "vitezy_david", name: "Vitézy Dávid", color: "#3fae5a" }],
    playableSides: [
      {
        id: "lmp",
        label: "LMP – Podmaniczky Mozgalom",
        mainCandidates: [{ id: "vitezy_david", label: "Vitézy Dávid" }],
      },
    ],
    electionAssets: [
      {
        id: "lmp",
        party_logo: "/images/2024_budapest/podmaninczky_mozgalom.jpg",
        candidateAssets: [
          {
            id: "vitezy_david",
            portrait: "/images/2024_budapest/vitezy_david.jpg",
            slogan: "",
          },
        ],
      },
    ],
    districtMap: "budapest-districts",
  },
} as unknown as CampaignConfig;

const state = {
  activeCampaignId: "2024_budapest",
  playerSide: { partyId: "lmp", candidateId: "vitezy_david" },
} as unknown as CampaignState;

const campaign = {
  id: "2024_budapest",
  label: "2024: Budapest",
  route: "2024_budapest",
  campaignBanner: "default-banner.png",
  thinCampaignBanner: "default-banner-thin.png",
} as CampaignHeader;

describe("stripYearPrefix", () => {
  it("drops the year from a campaign label", () => {
    expect(stripYearPrefix("2022: Béke vs Remény")).toBe("Béke vs Remény");
  });
});

describe("getCampaignBadgeInfo", () => {
  it("collects the campaign, party and candidate of a mayoral side", () => {
    expect(getCampaignBadgeInfo(state, config, campaign)).toEqual({
      year: "2024",
      electionTitle: "Budapest – főpolgármester-választás 2024",
      campaignName: "Budapest",
      bannerUrl: "/images/2024_budapest/default-banner-thin.png",
      color: "#3fae5a",
      partyName: "LMP – Podmaniczky Mozgalom",
      partyLogo: "/images/2024_budapest/podmaninczky_mozgalom.jpg",
      candidateName: "Vitézy Dávid",
      candidatePortrait: "/images/2024_budapest/vitezy_david.jpg",
    });
  });

  it("works before the campaign list has loaded", () => {
    const info = getCampaignBadgeInfo(state, config, undefined);
    expect(info.campaignName).toBeUndefined();
    expect(info.bannerUrl).toBeUndefined();
    expect(info.year).toBe("2024");
  });
});
