import { CandidateInactiveReason } from "./campaign";
import { Condition } from "./condition";
import { RawEffect } from "./effects";

export const ABSTAIN_KEY = "_abstain";

export interface WithdrawCandidateEffect {
  type: "withdraw-candidate";
  candidateId: string;
  endorsedCandidateId?: string;
  reason?: CandidateInactiveReason;
  redistribution: Record<string, number>;
}

export type CampaignEventEffect = RawEffect | WithdrawCandidateEffect;

export interface CampaignEventBranch {
  if: Condition;
  effects: CampaignEventEffect[];
}

export interface CampaignEventAnnouncement {
  title: string;
  body: string;
  imageUri?: string;
}

export interface CampaignEvent {
  id: string;
  label?: string;
  once?: boolean;
  priority?: number;
  conditions: CampaignEventBranch[];
  announcement?: CampaignEventAnnouncement;
}
