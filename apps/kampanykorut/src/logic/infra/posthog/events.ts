import { v4 as uuidv4 } from "uuid";
import type { MayoralOutcome } from "@/shared/types";

export const ANALYTICS_SCHEMA_VERSION = 1;

export interface RunProperties {
  run_id: string;
  campaign_id: string;
  side_id?: string;
}

export type LoadDurationBucket = "<1s" | "1-3s" | "3-10s" | ">10s";

export type CampaignOutcome = "win" | "loss" | "deadlock";

export interface AnalyticsEvents {
  landing_exited: { target: "menu" | "campaign" };
  campaign_start_clicked: RunProperties;
  campaign_loaded: RunProperties & {
    resumed: boolean;
    load_ms_bucket?: LoadDurationBucket;
  };
  campaign_load_failed: {
    campaign_id?: string;
    stage: "config" | "state";
  };
  first_question_viewed: RunProperties;
  turn_committed: RunProperties & { turn: number; persisted: boolean };
  storage_failed: {
    reason: "quota" | "other";
    key_kind: "campaign_state" | "turn_history" | "other";
  };
  campaign_finished: RunProperties & {
    outcome: CampaignOutcome;
    majority_type: "simple" | "supermajority" | null;
    turns: number;
  };
}

export type AnalyticsEventName = keyof AnalyticsEvents;

export function getSideId(partyId?: string, candidateId?: string) {
  return partyId && candidateId ? `${partyId}/${candidateId}` : undefined;
}

const runIds = new Map<string, string>();

export function getRunId(sessionId: string) {
  let runId = runIds.get(sessionId);
  if (!runId) {
    runId = uuidv4();
    runIds.set(sessionId, runId);
  }
  return runId;
}

export function getRunProperties(
  sessionId: string,
  campaignId: string,
  playerSide?: { partyId?: string; candidateId?: string },
): RunProperties {
  return {
    run_id: getRunId(sessionId),
    campaign_id: campaignId,
    side_id: getSideId(playerSide?.partyId, playerSide?.candidateId),
  };
}

export function getLoadDurationBucket(ms: number): LoadDurationBucket {
  if (ms < 1000) {
    return "<1s";
  }
  if (ms < 3000) {
    return "1-3s";
  }
  if (ms < 10000) {
    return "3-10s";
  }
  return ">10s";
}

export function getStorageKeyKind(
  key: string,
): AnalyticsEvents["storage_failed"]["key_kind"] {
  if (key.includes("campaignState")) {
    return "campaign_state";
  }
  if (key.includes("turnHistory")) {
    return "turn_history";
  }
  return "other";
}

export function getCampaignOutcome(
  winnerPartyId: string | undefined,
  hasMajority: boolean,
  playerPartyId: string | undefined,
): CampaignOutcome {
  if (!hasMajority) {
    return "deadlock";
  }
  return winnerPartyId === playerPartyId ? "win" : "loss";
}

export function getMayoralCampaignOutcome(
  outcome: MayoralOutcome | undefined,
  playerCandidateId: string | undefined,
): CampaignOutcome {
  if (outcome?.kind !== "winner") {
    return "deadlock";
  }
  return outcome.candidateId === playerCandidateId ? "win" : "loss";
}
