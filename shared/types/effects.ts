import { Answer } from "./answer";
import { DistrictTarget, DistrictTargetGroup } from "./district";

export type PartyShareParams = {
  newVotes: number;
  share: Record<string, number>;
};

export interface RawAnsweEffectProps {
  id: string;
  answers: Answer[];
}

export type AppliedEffect =
  | {
      type: EffectType.UniformSwing;
      baseShare: Record<string, number>;
      targetShare: Record<string, number>;
    }
  | {
      type: EffectType.VoteAllocation;
      newVotes: number;
      share: Record<string, number>;
    }
  | {
      type: EffectType.DistrictVoteTransfer;
      target: DistrictTarget[];
    }
  | {
      type: EffectType.TurnoutChange;
      motivationDelta: Record<string, number>;
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

export type ConditionalRawEffect = {
  if: {
    questionId: string;
    answerId: string;
  }[];
  mode: "merge" | "replace";
  effects: RawEffect[];
};

export enum EffectType {
  UniformSwing = "uniform-swing",
  VoteAllocation = "vote-allocation",
  TurnoutChange = "turnout-change",
  DistrictVoteTransfer = "district-vote-transfer",
}
