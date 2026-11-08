import {
  CampaignConfig,
  CampaignEvent,
  CampaignEventAnnouncement,
  CampaignState,
  GameMode,
} from "../types";
import { getCampaignEventState } from "./CampaignStateAccess";
import type { Answers } from "./ConditionCheck";
import { hasFocusNews } from "./PoliticalFocus";
import { getUnseenRelationIds } from "./PoliticalRelations";

export interface PublicEvent extends CampaignEventAnnouncement {
  id: string;
  // Missing for events recorded before trigger turns were stored.
  turn?: number;
}

export interface DashboardOverview {
  turn: number;
  totalTurns: number;
  latestEvent?: PublicEvent;
  publicEventCount: number;
  hasUnseenEvents: boolean;
}

export function getGameMode(
  config?: Pick<CampaignConfig, "politicalConfig">,
): GameMode {
  return config?.politicalConfig?.gameMode ?? "classic";
}

export function isStrategicMode(
  config?: Pick<CampaignConfig, "politicalConfig">,
): boolean {
  return getGameMode(config) === "strategic";
}

export function getTotalTurns(
  state: Pick<CampaignState, "decisionCount" | "playerSide">,
  config: Pick<CampaignConfig, "playableSides">,
): number {
  const { partyId = "", candidateId = "" } = state.playerSide ?? {};
  return (
    state.decisionCount ??
    config.playableSides?.[partyId]?.[candidateId]?.questions?.length ??
    0
  );
}

// An event becomes public only after its announcement was acknowledged, so the
// dashboard never reveals what the player has not been shown yet.
export function getPublicEvents(
  state: Pick<CampaignState, "campaignEvents">,
  events: CampaignEvent[] = [],
): PublicEvent[] {
  const { triggeredEventIds, pendingAnnouncementIds, triggeredAtTurn } =
    getCampaignEventState(state);
  return triggeredEventIds.flatMap((id) => {
    const announcement = events.find((e) => e.id === id)?.announcement;
    if (!announcement || pendingAnnouncementIds.includes(id)) {
      return [];
    }
    return [{ id, ...announcement, turn: triggeredAtTurn?.[id] }];
  });
}

export function getUnseenPublicEventIds(
  state: Pick<CampaignState, "campaignEvents" | "politicalDashboard">,
  events: CampaignEvent[] = [],
): string[] {
  const seen = state.politicalDashboard?.seenEventIds ?? [];
  return getPublicEvents(state, events)
    .map((e) => e.id)
    .filter((id) => !seen.includes(id));
}

export function markPublicEventsSeen(
  state: CampaignState,
  events: CampaignEvent[] = [],
): CampaignState {
  const unseen = getUnseenPublicEventIds(state, events);
  if (unseen.length === 0) {
    return state;
  }
  return {
    ...state,
    politicalDashboard: {
      ...state.politicalDashboard,
      seenEventIds: [
        ...(state.politicalDashboard?.seenEventIds ?? []),
        ...unseen,
      ],
    },
  };
}

export function buildDashboardOverview(
  state: CampaignState,
  config: Pick<CampaignConfig, "campaignEvents" | "playableSides">,
): DashboardOverview {
  const publicEvents = getPublicEvents(state, config.campaignEvents);
  return {
    turn: state.turn,
    totalTurns: getTotalTurns(state, config),
    latestEvent: publicEvents.at(-1),
    publicEventCount: publicEvents.length,
    hasUnseenEvents:
      getUnseenPublicEventIds(state, config.campaignEvents).length > 0,
  };
}

export function hasDashboardNews(
  state: CampaignState,
  config: Pick<
    CampaignConfig,
    "campaignEvents" | "politicalConfig" | "electionConfig"
  >,
  answers: Answers,
): boolean {
  return (
    getUnseenPublicEventIds(state, config.campaignEvents).length > 0 ||
    getUnseenRelationIds(state).length > 0 ||
    hasFocusNews(state, config, answers)
  );
}
