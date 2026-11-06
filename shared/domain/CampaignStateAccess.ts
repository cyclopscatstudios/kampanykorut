import {
  CampaignEvent,
  CampaignEventAnnouncement,
  CampaignEventState,
  CampaignState,
  CandidateStatus,
} from "../types";

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

export function acknowledgeAnnouncement(
  state: CampaignState,
  eventId: string,
): CampaignState {
  const { triggeredEventIds, pendingAnnouncementIds } =
    getCampaignEventState(state);
  if (!pendingAnnouncementIds.includes(eventId)) {
    return state;
  }
  return {
    ...state,
    campaignEvents: {
      triggeredEventIds,
      pendingAnnouncementIds: pendingAnnouncementIds.filter(
        (id) => id !== eventId,
      ),
    },
  };
}

export function getPendingAnnouncement(
  state: Pick<CampaignState, "campaignEvents">,
  events: CampaignEvent[] = [],
): { eventId: string; announcement: CampaignEventAnnouncement } | undefined {
  for (const eventId of getCampaignEventState(state).pendingAnnouncementIds) {
    const announcement = events.find((e) => e.id === eventId)?.announcement;
    if (announcement) {
      return { eventId, announcement };
    }
  }
  return undefined;
}
