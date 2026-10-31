import { Condition } from "./condition";
import { RawEffect } from "./effects";

export type CampaignEventEffect = RawEffect;

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
