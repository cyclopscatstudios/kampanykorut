import { CandidateInactiveReason } from "./campaign";
import { Condition } from "./condition";
import { RawEffect } from "./effects";
import { BootstrapIcon } from "./icon";
import { RelationStanding } from "./political";

export const ABSTAIN_KEY = "_abstain";

export interface WithdrawCandidateEffect {
  type: "withdraw-candidate";
  candidateId: string;
  endorsedCandidateId?: string;
  reason?: CandidateInactiveReason;
  redistribution: Record<string, number>;
}

// `from` is the share of each source party's votes the new party takes in every
// district; `fromByMegye` overrides it county by county (keyed by megyekod).
export interface SplitPartyEffect {
  type: "split-party";
  partyId: string;
  from: Record<string, number>;
  fromByMegye?: Record<string, Record<string, number>>;
}

export interface SetRelationEffect extends RelationStanding {
  type: "set-relation";
  relationId: string;
}

export type CampaignEventEffect =
  | RawEffect
  | WithdrawCandidateEffect
  | SplitPartyEffect
  | SetRelationEffect;

export interface CampaignEventBranch {
  if: Condition;
  effects: CampaignEventEffect[];
}

export interface CampaignEventAnnouncement {
  title: string;
  body: string;
  imageUri?: string;
  icon?: BootstrapIcon;
  // Major events get a larger node in the chronicle.
  major?: boolean;
}

export interface CampaignEvent {
  id: string;
  label?: string;
  once?: boolean;
  priority?: number;
  conditions: CampaignEventBranch[];
  announcement?: CampaignEventAnnouncement;
}
