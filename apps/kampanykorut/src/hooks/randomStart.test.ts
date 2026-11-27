import type { PlayableSide } from "@shared/types";
import { pickRandomCampaign, pickRandomSide } from "./randomStart";

const side = (id: string, playableCandidates?: string[]) =>
  ({ id, label: id, mainCandidates: [], playableCandidates }) as PlayableSide;

describe("pickRandomCampaign", () => {
  const campaigns = [
    { id: "strategic", gameMode: "strategic" as const },
    { id: "a", gameMode: "classic" as const },
    { id: "b", gameMode: "classic" as const },
  ];

  it("only picks classic campaigns", () => {
    expect(pickRandomCampaign(campaigns, () => 0)).toBe("a");
    expect(pickRandomCampaign(campaigns, () => 0.99)).toBe("b");
  });

  it("returns undefined without a classic campaign", () => {
    expect(pickRandomCampaign([campaigns[0]], () => 0)).toBeUndefined();
  });
});

describe("pickRandomSide", () => {
  it("skips sides without a playable candidate", () => {
    const sides = [side("empty", []), side("none"), side("p", ["c1", "c2"])];
    expect(pickRandomSide(sides, () => 0.99)).toEqual({
      partyId: "p",
      candidateId: "c2",
    });
  });

  it("returns undefined when nothing is playable", () => {
    expect(pickRandomSide([side("empty", [])], () => 0)).toBeUndefined();
  });
});
