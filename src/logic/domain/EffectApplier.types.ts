import type {
  DistrictTarget,
  DistrictTargetGroup,
  Shares,
} from "./ResultTransformer/VoteShareTransformer.types";

export enum EffectType {
  UniformSwing = "uniform-swing",
  VoteAllocation = "vote-allocation",
  TurnoutChange = "turnout-change",
  DistrictVoteTransfer = "district-vote-transfer",
}

export type PartyShareParams = {
  newVotes: number;
  share: Record<string, number>;
};

export type ConditionalRawEffect = {
  if: {
    questionId: string;
    answerId: string;
  }[];
  mode: "merge" | "replace";
  effects: RawEffect[];
};

export type RawEffect =
  | {
      type: EffectType.UniformSwing;
      params: Record<string, number>;
    }
  | {
      type: EffectType.VoteAllocation;
      params: PartyShareParams;
    }
  | {
      type: EffectType.DistrictVoteTransfer;
      params: DistrictTarget[] | DistrictTargetGroup[];
    }
  | {
      type: EffectType.TurnoutChange;
      params: Record<string, number>;
    };

export type AppliedEffect =
  | {
      type: EffectType.UniformSwing;
      baseShare: Shares;
      targetShare: Shares;
    }
  | {
      type: EffectType.VoteAllocation;
      newVotes: number;
      share: Record<string, number>;
    }
  | {
      type: EffectType.DistrictVoteTransfer;
      target: DistrictTarget[] | DistrictTargetGroup[];
    }
  | {
      type: EffectType.TurnoutChange;
      motivationDelta: Record<string, number>;
    };
