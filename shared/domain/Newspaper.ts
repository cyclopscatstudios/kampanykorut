import {
  CampaignConfig,
  CampaignState,
  Condition,
  NewspaperCadence,
  NewspaperConfig,
  NewspaperEditionView,
  NewspaperItem,
  NewspaperState,
} from "../types";
import { isStrategicMode } from "./PoliticalDashboard";

export const DEFAULT_NEWSPAPER_CADENCE: NewspaperCadence = {
  minTurns: 2,
  maxTurns: 3,
};

type NewspaperCampaign = Pick<CampaignConfig, "politicalConfig" | "newspaper">;

// The newspaper is a strategic-mode feature for now; a campaign without
// stories shows nothing of it.
export function getNewspaper(
  config: NewspaperCampaign,
): NewspaperConfig | undefined {
  const newspaper = config.newspaper;
  if (
    !isStrategicMode(config) ||
    !newspaper?.items?.length ||
    !newspaper.papers?.length
  ) {
    return undefined;
  }
  return newspaper;
}

export function getNewspaperState(
  state: Pick<CampaignState, "newspaper">,
): NewspaperState {
  return {
    editions: state.newspaper?.editions ?? [],
    readCount: state.newspaper?.readCount ?? 0,
    nextTurn: state.newspaper?.nextTurn,
  };
}

// Prints the next edition once its turn has come and a story is eligible;
// otherwise the state is returned unchanged and the next turn tries again.
export function publishNewspaperEdition(
  state: CampaignState,
  config: NewspaperCampaign,
  holds: (condition?: Condition) => boolean,
): CampaignState {
  const newspaper = getNewspaper(config);
  if (!newspaper || state.isEnded) {
    return state;
  }

  const cadence = getCadence(newspaper);
  const current = getNewspaperState(state);
  const dueTurn = current.nextTurn ?? cadence.minTurns;
  if (state.turn < dueTurn) {
    return state;
  }

  const printed = new Set(current.editions.map((e) => e.itemId));
  const eligible = newspaper.items.filter(
    (item) =>
      !printed.has(item.id) &&
      (item.priority === "pinned" || (item.weight ?? 1) > 0) &&
      (item.when === undefined || holds(item.when)),
  );
  if (eligible.length === 0) {
    return state;
  }

  const seed = `${state.activeCampaignId}:${current.editions.length}:${state.turn}`;
  const item = pickItem(eligible, seed);
  const span = cadence.maxTurns - cadence.minTurns + 1;
  const gap = cadence.minTurns + (hash(`${seed}:gap`) % span);

  return {
    ...state,
    newspaper: {
      ...current,
      editions: [...current.editions, { itemId: item.id, turn: state.turn }],
      nextTurn: state.turn + gap,
    },
  };
}

export function buildNewspaperEditions(
  state: Pick<CampaignState, "newspaper">,
  config: NewspaperCampaign,
): NewspaperEditionView[] {
  const newspaper = getNewspaper(config);
  if (!newspaper) {
    return [];
  }
  const issues = new Map<string, number>();
  return getNewspaperState(state).editions.flatMap((edition) => {
    const item = newspaper.items.find((i) => i.id === edition.itemId);
    if (!item) {
      return [];
    }
    const paper =
      newspaper.papers.find((p) => p.id === item.paper) ?? newspaper.papers[0];
    const issue = (issues.get(paper.id) ?? 0) + 1;
    issues.set(paper.id, issue);
    return [{ item, paper, issue, turn: edition.turn }];
  });
}

export function hasUnreadEdition(
  state: Pick<CampaignState, "newspaper">,
): boolean {
  const { editions, readCount } = getNewspaperState(state);
  return editions.length > readCount;
}

export function markNewspaperRead(state: CampaignState): CampaignState {
  const current = getNewspaperState(state);
  if (current.readCount >= current.editions.length) {
    return state;
  }
  return {
    ...state,
    newspaper: { ...current, readCount: current.editions.length },
  };
}

function getCadence(newspaper: NewspaperConfig): NewspaperCadence {
  const { minTurns, maxTurns } = newspaper.cadence ?? DEFAULT_NEWSPAPER_CADENCE;
  const min = Math.max(1, Math.floor(minTurns));
  return { minTurns: min, maxTurns: Math.max(min, Math.floor(maxTurns)) };
}

function pickItem(eligible: NewspaperItem[], seed: string): NewspaperItem {
  const pinned = eligible.find((item) => item.priority === "pinned");
  if (pinned) {
    return pinned;
  }
  const weights = eligible.map((item) => item.weight ?? 1);
  const total = weights.reduce((sum, w) => sum + w, 0);
  // A seeded pick keeps a reloaded session printing the same story.
  let roll = (hash(seed) / 0x100000000) * total;
  for (let i = 0; i < eligible.length; i++) {
    roll -= weights[i];
    if (roll < 0) {
      return eligible[i];
    }
  }
  return eligible[eligible.length - 1];
}

// FNV-1a, 32 bit.
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
