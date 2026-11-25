import { CandidateInactiveReason } from "./campaign";
import { Condition } from "./condition";
import { RawEffect } from "./effects";
import { BootstrapIcon } from "./icon";
import { GameModeScoped, RelationStanding } from "./political";

export const ABSTAIN_KEY = "_abstain";

export interface WithdrawCandidateEffect {
  type: "withdraw-candidate";
  candidateId: string;
  endorsedCandidateId?: string;
  reason?: CandidateInactiveReason;
  redistribution: Record<string, number>;
}

// Withdraws the party's candidate only in districts where the two named parties
// are within `maxGapPercent` points of each other; its list stays in the race.
export interface WithdrawDistrictCandidatesEffect {
  type: "withdraw-district-candidates";
  partyId: string;
  closeRace: { between: [string, string]; maxGapPercent: number };
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

export interface ShiftRelationEffect {
  type: "shift-relation";
  relationId: string;
  steps: number;
  description: string;
}

export type RelationEffect = SetRelationEffect | ShiftRelationEffect;

export type CampaignEventEffect =
  | RawEffect
  | ((
      | WithdrawCandidateEffect
      | WithdrawDistrictCandidatesEffect
      | SplitPartyEffect
      | RelationEffect
    ) &
      GameModeScoped);

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

export interface CampaignEvent extends GameModeScoped {
  id: string;
  label?: string;
  once?: boolean;
  priority?: number;
  conditions: CampaignEventBranch[];
  announcement?: CampaignEventAnnouncement;
}
