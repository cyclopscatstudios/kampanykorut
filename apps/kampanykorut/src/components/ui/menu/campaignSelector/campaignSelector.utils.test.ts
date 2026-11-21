import { describe, expect, it } from "vitest";
import type { CampaignHeader } from "@/logic/application";
import { isNewCampaign, sortCampaigns } from "./campaignSelector.utils";

function campaign(id: string, year: number, addedAt?: string): CampaignHeader {
  return {
    id,
    label: id,
    description: "",
    year,
    tags: [],
    route: id,
    campaignBanner: "banner.png",
    status: "published",
    gameMode: "classic",
    ...(addedAt ? { addedAt } : {}),
  };
}

describe("sortCampaigns", () => {
  const campaigns = [
    campaign("a", 2022, "2026-08-01"),
    campaign("b", 1957, "2026-11-09"),
    campaign("c", 2026, "2026-08-01"),
    campaign("d", 2024),
  ];

  it("orders by year, newest first", () => {
    expect(sortCampaigns(campaigns, "year").map((c) => c.id)).toEqual([
      "c",
      "d",
      "a",
      "b",
    ]);
  });

  it("orders by date added, then by year, undated last", () => {
    expect(sortCampaigns(campaigns, "added").map((c) => c.id)).toEqual([
      "b",
      "c",
      "a",
      "d",
    ]);
  });

  it("does not mutate the input", () => {
    sortCampaigns(campaigns, "year");
    expect(campaigns[0].id).toBe("a");
  });
});

describe("isNewCampaign", () => {
  const now = new Date("2026-11-21T12:00:00Z");

  it("is new within 30 days", () => {
    expect(isNewCampaign({ addedAt: "2026-10-31" }, now)).toBe(true);
  });

  it("is not new after 30 days", () => {
    expect(isNewCampaign({ addedAt: "2026-10-01" }, now)).toBe(false);
  });

  it("is not new without a date or with a future date", () => {
    expect(isNewCampaign({}, now)).toBe(false);
    expect(isNewCampaign({ addedAt: "2026-12-24" }, now)).toBe(false);
  });
});
