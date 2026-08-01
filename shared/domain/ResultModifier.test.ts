import { container } from "tsyringe";
import { beforeEach, describe, expect, it } from "vitest";
import { AppliedEffect, EffectType } from "../types";
import { campaignState } from "./mocks/mockCampaignState";
import { ResultModifier } from "./ResultModifier";

describe("ResultModifier", () => {
  let modifier: ResultModifier;

  beforeEach(() => {
    modifier = container.resolve(ResultModifier);
  });

  it("returns null when appliedEffects is empty", () => {
    expect(modifier.apply(campaignState, [])).toBeNull();
  });

  it("returns null when appliedEffects is undefined", () => {
    expect(modifier.apply(campaignState, undefined)).toBeNull();
  });

  it("applies VoteAllocation effect", () => {
    const effect: AppliedEffect = {
      type: EffectType.VoteAllocation,
      newVotes: 1000,
      share: { party_a: 0.6, party_b: 0.4 },
    };

    const result = modifier.apply(campaignState, [effect]);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("candidateListData");
    expect(result).toHaveProperty("partyListData");
  });

  it("applies TurnoutChange effect", () => {
    const effect: AppliedEffect = {
      type: EffectType.TurnoutChange,
      motivationDelta: { party_a: 2, party_b: -1 },
    };

    const result = modifier.apply(campaignState, [effect]);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("candidateListData");
    expect(result).toHaveProperty("partyListData");
  });

  it("returns null for unknown effect type and skips it", () => {
    const unknownEffect = { type: "unknown-type" } as unknown as AppliedEffect;

    const result = modifier.apply(campaignState, [unknownEffect]);

    expect(result).toEqual({
      candidateListData: campaignState.candidateListData,
      partyListData: campaignState.partyListData,
    });
  });

  it("accumulates multiple effects sequentially", () => {
    const effects: AppliedEffect[] = [
      {
        type: EffectType.UniformSwing,
        baseShare: { party_a: 50 },
        targetShare: { party_a: 49 },
      },
      {
        type: EffectType.TurnoutChange,
        motivationDelta: { party_a: 1 },
      },
    ];

    const result = modifier.apply(campaignState, effects);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("candidateListData");
    expect(result).toHaveProperty("partyListData");
  });

  it("applyEffectForPollingData flag does not affect computed result data", () => {
    const effect: AppliedEffect = {
      type: EffectType.UniformSwing,
      baseShare: { party_a: 50 },
      targetShare: { party_a: 49 },
    };
    const withoutFlag = modifier.apply(campaignState, [effect]);
    const withFlag = modifier.apply(campaignState, [effect], true);
    expect(withFlag).toEqual(withoutFlag);
  });
});
