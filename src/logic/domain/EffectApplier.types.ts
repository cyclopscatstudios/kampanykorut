import type {
  DistrictTarget,
  Shares,
} from "./ResultTransformer/PipelineTransform.types";

export enum EffectType {
  PartySwing = "party-swing",
  PartyShare = "party-share",
  Motivation = "motivation",
  District = "district",
}

export type PartyShareParams = {
  newVotes: number;
  share: Record<string, number>;
};

export type RawEffect =
  | {
      type: EffectType.PartySwing;
      params: Record<string, number>;
    }
  | {
      type: EffectType.PartyShare;
      params: PartyShareParams;
    }
  | {
      type: EffectType.District;
      params: DistrictTarget[];
    }
  | {
      type: EffectType.Motivation;
      params: Record<string, number>;
    };

export type AppliedEffect =
  | {
      type: EffectType.PartySwing;
      baseShare: Shares;
      targetShare: Shares;
    }
  | {
      type: EffectType.PartyShare;
      newVotes: number;
      share: Record<string, number>;
    }
  | {
      type: EffectType.District;
      params: DistrictTarget[];
    }
  | {
      type: EffectType.Motivation;
      motivationDelta: Record<string, number>;
    };
