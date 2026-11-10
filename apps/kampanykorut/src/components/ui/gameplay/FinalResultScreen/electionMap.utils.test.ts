import { CampaignConfig } from "@/shared/types";
import {
  calculateVotePercentages,
  getDistrictRegion,
  getPartyRows,
  getResultTitle,
} from "./electionMap.utils";

const config = {
  electionConfig: {
    parties: [
      { id: "a", name: "A Párt", color: "#000", leader: "Vezér Anna" },
      { id: "b", name: "B Párt", color: "#fff" },
    ],
    election: {
      type: "proportional",
      regions: [{ id: "r1", name: "Egy", seats: 3, megyekods: [1] }],
    },
  },
} as unknown as CampaignConfig;

const results = {
  regions: [
    {
      id: "r1",
      name: "Egy",
      seats: 3,
      votes: {},
      allocation: { a: 2, b: 1 },
    },
  ],
};

describe("electionMap.utils", () => {
  it("lists parties by their leader with the seats of the region", () => {
    const region = getDistrictRegion({ megyekod: 1 }, config, results);
    const votes = calculateVotePercentages({ a: 40, b: 60, _other: 5 });
    expect(
      getPartyRows(votes, config, region).map((r) => [r.name, r.seats]),
    ).toEqual([
      ["B Párt", 1],
      ["Vezér Anna", 2],
    ]);
  });

  it("finds no region for a county outside every region", () => {
    expect(getDistrictRegion({ megyekod: 2 }, config, results)).toBeUndefined();
  });

  it("titles a whole-county district by the county alone", () => {
    expect(getResultTitle({ megye: "Zala", oevk: 1, telepules: "Zala" })).toBe(
      "Zala",
    );
    expect(getResultTitle({ megye: "Pest", oevk: 2, telepules: "Vác" })).toBe(
      "Pest 2",
    );
  });
});
