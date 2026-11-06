import { EffectType, RawEffect } from "../types";
import {
  excludeInactiveCandidates,
  excludeInactiveFromConditionalEffects,
} from "./InactiveCandidateFilter";

const inactive = ["szentkiralyi"];

describe("excludeInactiveCandidates", () => {
  it("returns the same effects when no candidate is inactive", () => {
    const effects: RawEffect[] = [
      { type: EffectType.UniformSwing, params: { szentkiralyi: 2 } },
    ];
    expect(excludeInactiveCandidates(effects, [])).toBe(effects);
  });

  it("drops inactive keys from swings and turnout changes", () => {
    expect(
      excludeInactiveCandidates(
        [
          {
            type: EffectType.UniformSwing,
            params: { szentkiralyi: 2, vitezy: 1 },
          },
          { type: EffectType.TurnoutChange, params: { szentkiralyi: 1 } },
        ],
        inactive,
      ),
    ).toEqual([{ type: EffectType.UniformSwing, params: { vitezy: 1 } }]);
  });

  it("renormalizes vote allocation among the remaining candidates", () => {
    expect(
      excludeInactiveCandidates(
        [
          {
            type: EffectType.VoteAllocation,
            params: {
              newVotes: 1000,
              share: { szentkiralyi: 0.5, vitezy: 0.25, karacsony: 0.25 },
            },
          },
        ],
        inactive,
      ),
    ).toEqual([
      {
        type: EffectType.VoteAllocation,
        params: { newVotes: 1000, share: { vitezy: 0.5, karacsony: 0.5 } },
      },
    ]);
    expect(
      excludeInactiveCandidates(
        [
          {
            type: EffectType.VoteAllocation,
            params: { newVotes: 1000, share: { szentkiralyi: 1 } },
          },
        ],
        inactive,
      ),
    ).toEqual([]);
  });

  it("drops district transfers to an inactive candidate", () => {
    expect(
      excludeInactiveCandidates(
        [
          {
            type: EffectType.DistrictVoteTransfer,
            params: [
              {
                megyekod: 1,
                oevk: 1,
                targetParty: "szentkiralyi",
                amount: 100,
              },
              { megyekod: 1, oevk: 2, targetParty: "vitezy", amount: 100 },
            ],
          },
        ],
        inactive,
      ),
    ).toEqual([
      {
        type: EffectType.DistrictVoteTransfer,
        params: [{ megyekod: 1, oevk: 2, targetParty: "vitezy", amount: 100 }],
      },
    ]);
  });

  it("filters conditional effects too", () => {
    expect(
      excludeInactiveFromConditionalEffects(
        [
          {
            if: [{ questionId: "q1", answerId: "A" }],
            mode: "merge",
            effects: [
              { type: EffectType.UniformSwing, params: { szentkiralyi: 1 } },
            ],
          },
        ],
        inactive,
      ),
    ).toEqual([
      { if: [{ questionId: "q1", answerId: "A" }], mode: "merge", effects: [] },
    ]);
  });
});
