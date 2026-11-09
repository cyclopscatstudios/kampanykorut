import { describe, expect, it } from "vitest";
import { CampaignState } from "../types";
import { isIntroPending, markIntroSeen } from "./CampaignIntro";

const intro = { intro: { text: "Történelmi háttér." } };
const fresh = { turn: 0, isEnded: false } as CampaignState;

describe("campaign intro", () => {
  it("is pending at the start of a campaign that has one", () => {
    expect(isIntroPending(fresh, intro)).toBe(true);
  });

  it("is not pending without an intro text", () => {
    expect(isIntroPending(fresh, {})).toBe(false);
    expect(isIntroPending(fresh, { intro: { text: "  " } })).toBe(false);
  });

  it("is not pending once seen, after the first turn or at the end", () => {
    expect(isIntroPending(markIntroSeen(fresh), intro)).toBe(false);
    expect(isIntroPending({ ...fresh, turn: 1 }, intro)).toBe(false);
    expect(isIntroPending({ ...fresh, isEnded: true }, intro)).toBe(false);
  });

  it("keeps the same state when already seen", () => {
    const seen = markIntroSeen(fresh);
    expect(markIntroSeen(seen)).toBe(seen);
  });
});
