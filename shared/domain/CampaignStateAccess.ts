import { CampaignEventState, CampaignState, CandidateStatus } from "../types";

export function getCandidateStatus(
  state: Pick<CampaignState, "candidates">,
  candidateId: string,
): CandidateStatus {
  return state.candidates?.[candidateId]?.status ?? "active";
}

export function getInactiveCandidateIds(
  state: Pick<CampaignState, "candidates">,
): string[] {
  return Object.entries(state.candidates ?? {})
    .filter(([, candidate]) => candidate.status === "inactive")
    .map(([id]) => id)
    .sort();
}

export function getCampaignEventState(
  state: Pick<CampaignState, "campaignEvents">,
): CampaignEventState {
  return {
    triggeredEventIds: state.campaignEvents?.triggeredEventIds ?? [],
    pendingAnnouncementIds: state.campaignEvents?.pendingAnnouncementIds ?? [],
  };
}
