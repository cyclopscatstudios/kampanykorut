import {
  CampaignConfig,
  CampaignState,
  Condition,
  FocusBranch,
  FocusStatus,
  PoliticalFocus,
} from "../types";
import { getSelectedFocusIds } from "./CampaignStateAccess";
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

export type FocusBranchState = "decided" | "open" | "upcoming";

export interface FocusBranchView {
  id: string;
  title?: string;
  state: FocusBranchState;
  revisable: boolean;
  focuses: FocusView[];
  availableFromTurn?: number;
  requiredBeforeTurn?: number;
}

export interface FocusOverview {
  branches: FocusBranchView[];
  current?: FocusBranchView;
  selected: FocusView[];
  latest?: FocusView;
}

type FocusConfig = Pick<CampaignConfig, "politicalConfig" | "electionConfig">;
type BranchConfig = Pick<CampaignConfig, "politicalConfig">;

export function getFocuses(config: BranchConfig): PoliticalFocus[] {
  return config.politicalConfig?.focuses ?? [];
}

export function getFocusBranches(config: BranchConfig): FocusBranch[] {
  const branches = config.politicalConfig?.focusBranches;
  if (branches) {
    return branches;
  }
  const focuses = getFocuses(config);
  return focuses.length > 0
    ? [{ id: "focus", focuses: focuses.map((f) => f.id) }]
    : [];
}

function getCurrentTurn(state: Pick<CampaignState, "turn">): number {
  return state.turn + 1;
}

function getChoice(branch: FocusBranch, selectedIds: string[]) {
  return branch.focuses.find((id) => selectedIds.includes(id));
}

function isOnPath(branch: FocusBranch, selectedIds: string[]) {
  return branch.requires === undefined || selectedIds.includes(branch.requires);
}

export function getCurrentBranch(
  state: Pick<CampaignState, "politicalDashboard">,
  config: BranchConfig,
): FocusBranch | undefined {
  const selectedIds = getSelectedFocusIds(state);
  return getFocusBranches(config).find(
    (branch) =>
      isOnPath(branch, selectedIds) && !getChoice(branch, selectedIds),
  );
}

function getRevisableBranch(
  state: CampaignState,
  config: BranchConfig,
): FocusBranch | undefined {
  const latest = getSelectedFocusIds(state).at(-1);
  if (
    state.isEnded ||
    latest === undefined ||
    state.politicalDashboard?.focusChosenAtTurn !== state.turn
  ) {
    return undefined;
  }
  return getFocusBranches(config).find((b) => b.focuses.includes(latest));
}

function getOpeningTurn(state: CampaignState, branch: FocusBranch): number {
  const from = branch.availableFromTurn ?? 1;
  const chosenAt = state.politicalDashboard?.focusChosenAtTurn;
  return chosenAt === undefined ? from : Math.max(from, chosenAt + 2);
}

function isBranchOpen(state: CampaignState, branch: FocusBranch): boolean {
  return getCurrentTurn(state) >= getOpeningTurn(state, branch);
}

function isKnownFocus(config: BranchConfig, focusId: string) {
  return getFocuses(config).some((f) => f.id === focusId);
}

export function canSelectFocus(
  state: CampaignState,
  config: BranchConfig,
  focusId: string,
): boolean {
  if (state.isEnded || !isKnownFocus(config, focusId)) {
    return false;
  }
  const revisable = getRevisableBranch(state, config);
  if (revisable) {
    return (
      revisable.focuses.includes(focusId) &&
      getSelectedFocusIds(state).at(-1) !== focusId
    );
  }
  const branch = getCurrentBranch(state, config);
  return (
    branch !== undefined &&
    isBranchOpen(state, branch) &&
    branch.focuses.includes(focusId)
  );
}

export function isFocusRequired(
  state: CampaignState,
  config: BranchConfig,
): boolean {
  const branch = getCurrentBranch(state, config);
  return (
    !state.isEnded &&
    branch?.requiredBeforeTurn !== undefined &&
    isBranchOpen(state, branch) &&
    getCurrentTurn(state) >= branch.requiredBeforeTurn
  );
}

function getFocusStatusKey(overview: FocusOverview): string | undefined {
  return overview.selected.length > 0
    ? overview.selected.map((f) => `${f.id}:${f.status}`).join(",")
    : undefined;
}

export function hasFocusNews(
  state: CampaignState,
  config: FocusConfig,
  answers: Answers,
): boolean {
  if (state.isEnded || getFocuses(config).length === 0) {
    return false;
  }
  const overview = buildFocusOverview(state, config, answers);
  if (overview.current?.state === "open") {
    return true;
  }
  const key = getFocusStatusKey(overview);
  return key !== undefined && key !== state.politicalDashboard?.seenFocusStatus;
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

export function selectFocus(
  state: CampaignState,
  config: BranchConfig,
  focusId: string,
): CampaignState {
  if (!canSelectFocus(state, config, focusId)) {
    return state;
  }
  const selectedIds = getSelectedFocusIds(state);
  const kept = getRevisableBranch(state, config)
    ? selectedIds.slice(0, -1)
    : selectedIds;
  const dashboard = { ...state.politicalDashboard };
  delete dashboard.selectedFocusId;
  return {
    ...state,
    politicalDashboard: {
      ...dashboard,
      seenEventIds: dashboard.seenEventIds ?? [],
      selectedFocusIds: [...kept, focusId],
      focusChosenAtTurn: state.turn,
    },
  };
}

export function buildFocusOverview(
  state: CampaignState,
  config: FocusConfig,
  answers: Answers,
): FocusOverview {
  const selectedIds = getSelectedFocusIds(state);
  const holds = createConditionCheck(state, answers, config.electionConfig);
  const focuses = new Map(getFocuses(config).map((f) => [f.id, f]));
  const current = getCurrentBranch(state, config);
  const revisable = getRevisableBranch(state, config);

  const toView = (focus: PoliticalFocus, status: FocusStatus): FocusView => ({
    id: focus.id,
    title: focus.title,
    summary: focus.summary,
    description: focus.description,
    icon: focus.icon,
    status,
    selectable: canSelectFocus(state, config, focus.id),
  });

  const branches: FocusBranchView[] = [];
  for (const branch of getFocusBranches(config)) {
    if (!isOnPath(branch, selectedIds)) {
      continue;
    }
    const choice = getChoice(branch, selectedIds);
    const branchState: FocusBranchState = choice
      ? "decided"
      : isBranchOpen(state, branch)
        ? "open"
        : "upcoming";
    branches.push({
      id: branch.id,
      title: branch.title,
      state: branchState,
      revisable: branch === revisable,
      availableFromTurn:
        branchState === "upcoming"
          ? getOpeningTurn(state, branch)
          : branch.availableFromTurn,
      requiredBeforeTurn: branch.requiredBeforeTurn,
      focuses: branch.focuses.flatMap((id) => {
        const focus = focuses.get(id);
        if (!focus) {
          return [];
        }
        const status =
          id === choice
            ? getChosenStatus(focus, holds)
            : choice
              ? branch === revisable
                ? "available"
                : "excluded"
              : branch === current && branchState === "open"
                ? "available"
                : "upcoming";
        return [toView(focus, status)];
      }),
    });
    if (branch === current) {
      break;
    }
  }

  const views = new Map(
    branches.flatMap((b) => b.focuses).map((f) => [f.id, f]),
  );
  const selected = selectedIds.flatMap((id) => views.get(id) ?? []);
  return {
    branches,
    current: branches.find((b) => b.id === current?.id),
    selected,
    latest: selected.at(-1),
  };
}

function getChosenStatus(
  focus: PoliticalFocus,
  holds: (condition?: Condition) => boolean,
): FocusStatus {
  if (holds(focus.completeWhen)) {
    return "completed";
  }
  if (holds(focus.failWhen)) {
    return "failed";
  }
  return "selected";
}
