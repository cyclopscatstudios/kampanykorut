import {
  CampaignConfig,
  CampaignState,
  Condition,
  FocusStatus,
  HistoryItem,
  PoliticalFocus,
} from "../types";
import { getCampaignEventState } from "./CampaignStateAccess";
import { createConditionContext } from "./ConditionContext";
import {
  ConditionEvaluationError,
  evaluateCondition,
} from "./ConditionEvaluator";

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
}

type FocusConfig = Pick<CampaignConfig, "politicalConfig" | "electionConfig">;
type Answers = Pick<HistoryItem, "questionId" | "answerId">[];

export function getFocuses(config: FocusConfig): PoliticalFocus[] {
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

export function canSelectFocus(
  state: CampaignState,
  config: FocusConfig,
  focusId: string,
): boolean {
  return (
    !state.isEnded &&
    !isFocusLocked(state, config) &&
    getSelectedFocusId(state) !== focusId &&
    getFocuses(config).some((f) => f.id === focusId)
  );
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
  let context: ReturnType<typeof createConditionContext> | undefined;
  const holds = (condition?: Condition) => {
    if (!condition) {
      return false;
    }
    context ??= createConditionContext(state, answers, config.electionConfig);
    try {
      return evaluateCondition(condition, context);
    } catch (error) {
      // A condition that cannot be decided yet (e.g. no results before the
      // first poll) simply does not hold.
      if (error instanceof ConditionEvaluationError) {
        return false;
      }
      throw error;
    }
  };

  const focuses = getFocuses(config).map((focus): FocusView => {
    const status = getStatus(focus, selectedId, locked, holds);
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

  return {
    focuses,
    selected: focuses.find((f) => f.id === selectedId),
    locked,
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
