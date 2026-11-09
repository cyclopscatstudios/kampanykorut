import {
  CampaignConfig,
  CampaignState,
  Condition,
  FocusStatus,
  PoliticalFocus,
} from "../types";
import { getCampaignEventState } from "./CampaignStateAccess";
import { type Answers, createConditionCheck } from "./ConditionCheck";

export interface FocusView {
  id: string;
  title: string;
  summary: string;
  description: string;
  icon?: PoliticalFocus["icon"];
  status: FocusStatus;
  selectable: boolean;
}

export interface FocusOverview {
  focuses: FocusView[];
  selected?: FocusView;
  locked: boolean;
  hasOpposites: boolean;
  // Set while focus selection has not opened yet.
  availableFromTurn?: number;
  requiredBeforeTurn?: number;
}

type FocusConfig = Pick<CampaignConfig, "politicalConfig" | "electionConfig">;

export function getFocuses(
  config: Pick<CampaignConfig, "politicalConfig">,
): PoliticalFocus[] {
  return config.politicalConfig?.focuses ?? [];
}

export function getSelectedFocusId(
  state: Pick<CampaignState, "politicalDashboard">,
): string | undefined {
  return state.politicalDashboard?.selectedFocusId;
}

export function isFocusLocked(
  state: Pick<CampaignState, "campaignEvents">,
  config: Pick<CampaignConfig, "politicalConfig">,
): boolean {
  const lockEventId = config.politicalConfig?.focusLockEventId;
  return (
    lockEventId !== undefined &&
    getCampaignEventState(state).triggeredEventIds.includes(lockEventId)
  );
}

// Opposite focuses rule each other out: once one is chosen the other can no
// longer be picked. Either side of the pair may declare the exclusion.
export function isExcludedBySelection(
  config: Pick<CampaignConfig, "politicalConfig">,
  selectedId: string | undefined,
  focusId: string,
): boolean {
  if (!selectedId || selectedId === focusId) {
    return false;
  }
  const focuses = getFocuses(config);
  const selected = focuses.find((f) => f.id === selectedId);
  const focus = focuses.find((f) => f.id === focusId);
  return Boolean(
    selected?.excludes?.includes(focusId) ||
    focus?.excludes?.includes(selectedId),
  );
}

function getCurrentTurn(state: Pick<CampaignState, "turn">): number {
  return state.turn + 1;
}

export function isFocusSelectionOpen(
  state: Pick<CampaignState, "turn">,
  config: Pick<CampaignConfig, "politicalConfig">,
): boolean {
  const from = config.politicalConfig?.focusSelection?.availableFromTurn ?? 1;
  return getCurrentTurn(state) >= from;
}

export function canSelectFocus(
  state: CampaignState,
  config: FocusConfig,
  focusId: string,
): boolean {
  const selectedId = getSelectedFocusId(state);
  return (
    !state.isEnded &&
    isFocusSelectionOpen(state, config) &&
    !isFocusLocked(state, config) &&
    selectedId !== focusId &&
    !isExcludedBySelection(config, selectedId, focusId) &&
    getFocuses(config).some((f) => f.id === focusId)
  );
}

export function isFocusRequired(
  state: CampaignState,
  config: Pick<CampaignConfig, "politicalConfig">,
): boolean {
  const requiredBefore =
    config.politicalConfig?.focusSelection?.requiredBeforeTurn;
  return (
    requiredBefore !== undefined &&
    getCurrentTurn(state) >= requiredBefore &&
    getFocuses(config).length > 0 &&
    !getSelectedFocusId(state) &&
    !state.isEnded
  );
}

function getFocusStatusKey(overview: FocusOverview): string | undefined {
  return overview.selected
    ? `${overview.selected.id}:${overview.selected.status}`
    : undefined;
}

// News for the header dot: no direction chosen yet, or the chosen focus has
// changed status since the dashboard was last opened.
export function hasFocusNews(
  state: CampaignState,
  config: FocusConfig,
  answers: Answers,
): boolean {
  if (state.isEnded || getFocuses(config).length === 0) {
    return false;
  }
  const overview = buildFocusOverview(state, config, answers);
  if (!overview.selected) {
    return !overview.locked && overview.availableFromTurn === undefined;
  }
  return (
    getFocusStatusKey(overview) !== state.politicalDashboard?.seenFocusStatus
  );
}

export function markFocusSeen(
  state: CampaignState,
  config: FocusConfig,
  answers: Answers,
): CampaignState {
  if (getFocuses(config).length === 0) {
    return state;
  }
  const key = getFocusStatusKey(buildFocusOverview(state, config, answers));
  if (key === undefined || key === state.politicalDashboard?.seenFocusStatus) {
    return state;
  }
  return {
    ...state,
    politicalDashboard: {
      ...state.politicalDashboard,
      seenEventIds: state.politicalDashboard?.seenEventIds ?? [],
      seenFocusStatus: key,
    },
  };
}

// Selecting a focus only records the player's intent; it never changes
// support or triggers effects on its own.
export function selectFocus(
  state: CampaignState,
  config: FocusConfig,
  focusId: string,
): CampaignState {
  if (!canSelectFocus(state, config, focusId)) {
    return state;
  }
  return {
    ...state,
    politicalDashboard: {
      ...state.politicalDashboard,
      seenEventIds: state.politicalDashboard?.seenEventIds ?? [],
      selectedFocusId: focusId,
    },
  };
}

export function buildFocusOverview(
  state: CampaignState,
  config: FocusConfig,
  answers: Answers,
): FocusOverview {
  const selectedId = getSelectedFocusId(state);
  const locked = isFocusLocked(state, config);
  const holds = createConditionCheck(state, answers, config.electionConfig);

  const focuses = getFocuses(config).map((focus): FocusView => {
    const status = getStatus(
      focus,
      selectedId,
      locked || isExcludedBySelection(config, selectedId, focus.id),
      holds,
    );
    return {
      id: focus.id,
      title: focus.title,
      summary: focus.summary,
      description: focus.description,
      icon: focus.icon,
      status,
      selectable: canSelectFocus(state, config, focus.id),
    };
  });

  const selection = config.politicalConfig?.focusSelection;
  return {
    focuses,
    selected: focuses.find((f) => f.id === selectedId),
    locked,
    hasOpposites: getFocuses(config).some((f) => f.excludes?.length),
    availableFromTurn: isFocusSelectionOpen(state, config)
      ? undefined
      : selection?.availableFromTurn,
    requiredBeforeTurn: selectedId ? undefined : selection?.requiredBeforeTurn,
  };
}

function getStatus(
  focus: PoliticalFocus,
  selectedId: string | undefined,
  locked: boolean,
  holds: (condition?: Condition) => boolean,
): FocusStatus {
  if (focus.id !== selectedId) {
    return locked ? "excluded" : "available";
  }
  if (holds(focus.completeWhen)) {
    return "completed";
  }
  if (holds(focus.failWhen)) {
    return "failed";
  }
  return "selected";
}
