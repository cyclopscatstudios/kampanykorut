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
    .filter(([, candidate]) => candidate.status !== "active")
    .map(([id]) => id)
    .sort();
}

export function getDormantPartyStates(
  parties: { id: string; dormant?: boolean }[] = [],
): CampaignState["candidates"] {
  const dormant = parties.filter((party) => party.dormant);
  if (!dormant.length) {
    return undefined;
  }
  return Object.fromEntries(
    dormant.map((party) => [party.id, { status: "dormant" as const }]),
  );
}

export function getVisibleParties<T extends { id: string }>(
  parties: T[],
  state: Pick<CampaignState, "candidates"> | undefined,
): T[] {
  return parties.filter(
    (party) => state?.candidates?.[party.id]?.status !== "dormant",
  );
}

export function getCampaignEventState(
  state: Pick<CampaignState, "campaignEvents">,
): CampaignEventState {
  return {
    triggeredEventIds: state.campaignEvents?.triggeredEventIds ?? [],
    pendingAnnouncementIds: state.campaignEvents?.pendingAnnouncementIds ?? [],
    triggeredAtTurn: state.campaignEvents?.triggeredAtTurn ?? {},
  };
}

export function acknowledgeAnnouncement(
  state: CampaignState,
  eventId: string,
): CampaignState {
  const eventState = getCampaignEventState(state);
  const { pendingAnnouncementIds } = eventState;
  if (!pendingAnnouncementIds.includes(eventId)) {
    return state;
  }
  return {
    ...state,
    campaignEvents: {
      ...eventState,
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
