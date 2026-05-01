import { container } from "tsyringe";
import { ResultModifier } from "./ResultModifier";
import { EffectType, type AppliedEffect } from "../types/campaignEngine.types";
import { candidateListData, partyListData } from "./mocks/mockListData";
import type { CampaignState } from "./CampaignEngine";

const baseState: CampaignState = {
  turn: 0,
  isEnded: false,
  candidateListData,
  partyListData,
};

describe("ResultModifier", () => {
  let modifier: ResultModifier;

  beforeEach(() => {
    modifier = container.resolve(ResultModifier);
  });

  it("returns null when appliedEffects is empty", () => {
    expect(modifier.apply(baseState, [])).toBeNull();
  });

  it("returns null when appliedEffects is undefined", () => {
    expect(modifier.apply(baseState, undefined)).toBeNull();
  });

  it("applies VoteAllocation effect", () => {
    const effect: AppliedEffect = {
      type: EffectType.VoteAllocation,
      newVotes: 1000,
      share: { fidesz: 0.6, ellenzek: 0.4 },
    };

    const result = modifier.apply(baseState, [effect]);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("candidateListData");
    expect(result).toHaveProperty("partyListData");
  });

  it("applies DistrictVoteTransfer effect", () => {
    const effect: AppliedEffect = {
      type: EffectType.DistrictVoteTransfer,
      target: [{ megyekod: 1, oevk: 1, partok: { fidesz: -500, ellenzek: 500 } }],
    };

    const result = modifier.apply(baseState, [effect]);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("candidateListData");
    expect(result).toHaveProperty("partyListData");
  });

  it("applies TurnoutChange effect", () => {
    const effect: AppliedEffect = {
      type: EffectType.TurnoutChange,
      motivationDelta: { fidesz: 2, ellenzek: -1 },
    };

    const result = modifier.apply(baseState, [effect]);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("candidateListData");
    expect(result).toHaveProperty("partyListData");
  });

  it("returns null for unknown effect type and skips it", () => {
    const unknownEffect = { type: "unknown-type" } as unknown as AppliedEffect;

    const result = modifier.apply(baseState, [unknownEffect]);

    expect(result).toEqual({
      candidateListData: baseState.candidateListData,
      partyListData: baseState.partyListData,
    });
  });

  it("accumulates multiple effects sequentially", () => {
    const effects: AppliedEffect[] = [
      {
        type: EffectType.UniformSwing,
        baseShare: { fidesz: 50 },
        targetShare: { fidesz: 49 },
      },
      {
        type: EffectType.TurnoutChange,
        motivationDelta: { fidesz: 1 },
      },
    ];

    const result = modifier.apply(baseState, effects);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("candidateListData");
    expect(result).toHaveProperty("partyListData");
  });
});
