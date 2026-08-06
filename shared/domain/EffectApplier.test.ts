import { container } from "tsyringe";
import { beforeEach, describe, expect, it } from "vitest";
import {
  ConditionalRawEffect,
  DistrictTarget,
  EffectType,
  HistoryItem,
  RawEffect,
} from "../types";
import { EffectApplier } from "./EffectApplier";
import { mockCandidateListData } from "./mocks/mockListData";

let effectApplier: EffectApplier;

describe("ElectionEffectApplier – PartySwing", () => {
  beforeEach(() => {
    effectApplier = container.resolve(EffectApplier);
  });

  it("should call modifyByTarget with correct parameters", () => {
    const effect: RawEffect = {
      type: EffectType.UniformSwing,
      params: {
        party_a: -1,
      },
    };

    const result = effectApplier.getAppliedEffects(
      [effect],
      mockCandidateListData,
      0,
    );
    expect(result).toEqual([
      {
        type: EffectType.UniformSwing,
        baseShare: { party_a: 52.5 },
        targetShare: { party_a: 51.5 },
      },
    ]);
  });

  it("should call modifyByMotivation with correct parameters", () => {
    const effect: RawEffect = {
      type: EffectType.TurnoutChange,
      params: {
        party_a: 0.5,
        party_b: 1,
      },
    };
    const result = effectApplier.getAppliedEffects(
      [effect],
      mockCandidateListData,
      0,
    );
    expect(result).toEqual([
      {
        type: EffectType.TurnoutChange,
        motivationDelta: {
          party_a: 99.5,
          party_b: 100,
        },
      },
    ]);
  });

  it("should return correct result for PartyShare effect", () => {
    const effect: RawEffect = {
      type: EffectType.VoteAllocation,
      params: {
        newVotes: 1000,
        share: {
          party_a: 0.6,
          party_b: 0.4,
        },
      },
    };
    const result = effectApplier.getAppliedEffects(
      [effect],
      mockCandidateListData,
      0,
    );
    expect(result).toEqual([
      {
        type: EffectType.VoteAllocation,
        newVotes: 1000,
        share: {
          party_a: 0.6,
          party_b: 0.4,
        },
      },
    ]);
  });

  it("should return correct result for District effect", () => {
    const effect: RawEffect = {
      type: EffectType.DistrictVoteTransfer,
      params: [
        {
          amount: 100,
          megyekod: 1,
          oevk: 1,
          targetParty: "party_a",
          from: {
            party: "party_b",
            type: "party",
          },
        },
      ] as DistrictTarget[],
    };
    const result = effectApplier.getAppliedEffects(
      [effect],
      mockCandidateListData,
      0,
    );
    expect(result).toEqual([
      {
        target: [
          {
            amount: 100,
            from: {
              party: "party_b",
              type: "party",
            },
            megyekod: 1,
            oevk: 1,
            targetParty: "party_a",
          },
        ],
        type: "district-vote-transfer",
      },
    ]);
  });

  describe("EffectApplier – Conditional Effects", () => {
    it("should apply replace conditional effect", () => {
      const effect: RawEffect = {
        type: EffectType.DistrictVoteTransfer,
        params: [
          {
            amount: 100,
            megyekod: 1,
            oevk: 1,
            targetParty: "party_a",
            from: {
              party: "ellenzek",
              type: "party",
            },
          },
        ] as DistrictTarget[],
      };
      const conditionalEffect: ConditionalRawEffect = {
        if: [
          {
            questionId: "q1",
            answerId: "a1",
          },
        ],
        effects: [
          {
            type: EffectType.VoteAllocation,
            params: {
              newVotes: 1000,
              share: {
                fidesz: 0.6,
                ellenzek: 0.4,
              },
            },
          },
        ],
        mode: "replace",
      };
      const result = effectApplier.getAppliedEffects(
        [effect],
        mockCandidateListData,
        0,
        [conditionalEffect],
        undefined,
        undefined,
        undefined,
        [
          {
            questionId: "q1",
            answerId: "a1",
          } as HistoryItem,
        ],
      );
      expect(result).toEqual([
        {
          type: "vote-allocation",
          newVotes: 1000,
          share: {
            fidesz: 0.6,
            ellenzek: 0.4,
          },
        },
      ]);
    });
    it("should apply merge conditional effect", () => {
      const effect: RawEffect = {
        type: EffectType.DistrictVoteTransfer,
        params: [
          {
            amount: 100,
            megyekod: 1,
            oevk: 1,
            targetParty: "party_a",
            from: {
              party: "party_b",
              type: "party",
            },
          },
        ] as DistrictTarget[],
      };
      const conditionalEffect: ConditionalRawEffect = {
        if: [
          {
            questionId: "q1",
            answerId: "a1",
          },
        ],
        effects: [
          {
            type: EffectType.VoteAllocation,
            params: {
              newVotes: 1000,
              share: {
                party_a: 0.6,
                party_b: 0.4,
              },
            },
          },
        ],
        mode: "merge",
      };
      const result = effectApplier.getAppliedEffects(
        [effect],
        mockCandidateListData,
        0,
        [conditionalEffect],
        undefined,
        undefined,
        undefined,
        [
          {
            questionId: "q1",
            answerId: "a1",
          } as HistoryItem,
        ],
      );
      expect(result).toEqual([
        {
          target: [
            {
              amount: 100,
              from: {
                party: "party_b",
                type: "party",
              },
              megyekod: 1,
              oevk: 1,
              targetParty: "party_a",
            },
          ],
          type: "district-vote-transfer",
        },
        {
          type: "vote-allocation",
          newVotes: 1000,
          share: {
            party_a: 0.6,
            party_b: 0.4,
          },
        },
      ]);
    });
  });
});
