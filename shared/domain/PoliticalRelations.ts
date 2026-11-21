import {
  CampaignConfig,
  CampaignState,
  Relation,
  RelationEffect,
  RelationGroup,
  RelationStanding,
  RelationTone,
} from "../types";

export interface RelationView extends RelationStanding {
  id: string;
  name: string;
  icon?: RelationGroup["icon"];
  isNew: boolean;
}

export interface RelationGroupView extends RelationGroup {
  relations: RelationView[];
}

type RelationsConfig = Pick<CampaignConfig, "politicalConfig">;

export const RELATION_SCORE_RANGE = 6;

const TONE_SCORES: Record<RelationTone, number> = {
  good: 4,
  calm: 1,
  tense: -2,
  bad: -5,
};

export function getRelationToneForScore(score: number): RelationTone {
  if (score >= 3) {
    return "good";
  }
  if (score >= 0) {
    return "calm";
  }
  if (score >= -3) {
    return "tense";
  }
  return "bad";
}

type RelationDefinition = Pick<Relation, "id" | "tone"> &
  Partial<Pick<Relation, "label" | "labels">>;

export function setRelations(
  state: CampaignState,
  effects: RelationEffect[],
  definitions: RelationDefinition[] = [],
): CampaignState {
  if (effects.length === 0) {
    return state;
  }
  const relations = { ...state.politicalDashboard?.relations };
  for (const effect of effects) {
    const { relationId, description } = effect;
    if (effect.type === "set-relation") {
      relations[relationId] = {
        tone: effect.tone,
        label: effect.label,
        description,
        changedAtTurn: state.turn,
        score: TONE_SCORES[effect.tone],
      };
      continue;
    }
    const definition = definitions.find((r) => r.id === relationId);
    const current = relations[relationId];
    const currentTone = current?.tone ?? definition?.tone ?? "calm";
    const score = Math.max(
      -RELATION_SCORE_RANGE,
      Math.min(
        RELATION_SCORE_RANGE,
        (current?.score ?? TONE_SCORES[currentTone]) + effect.steps,
      ),
    );
    const tone = getRelationToneForScore(score);
    const label =
      definition?.labels?.[tone] ??
      (tone === currentTone
        ? (current?.label ?? definition?.label)
        : undefined) ??
      current?.label ??
      definition?.label ??
      "";
    relations[relationId] = {
      tone,
      label,
      description,
      changedAtTurn: state.turn,
      score,
    };
  }
  const changed = new Set(effects.map((e) => e.relationId));
  return {
    ...state,
    politicalDashboard: {
      ...state.politicalDashboard,
      seenEventIds: state.politicalDashboard?.seenEventIds ?? [],
      relations,
      seenRelationIds: (state.politicalDashboard?.seenRelationIds ?? []).filter(
        (id) => !changed.has(id),
      ),
    },
  };
}

export function getUnseenRelationIds(
  state: Pick<CampaignState, "politicalDashboard">,
): string[] {
  const seen = state.politicalDashboard?.seenRelationIds ?? [];
  return Object.keys(state.politicalDashboard?.relations ?? {}).filter(
    (id) => !seen.includes(id),
  );
}

export function markRelationsSeen(state: CampaignState): CampaignState {
  const unseen = getUnseenRelationIds(state);
  if (unseen.length === 0) {
    return state;
  }
  return {
    ...state,
    politicalDashboard: {
      ...state.politicalDashboard,
      seenEventIds: state.politicalDashboard?.seenEventIds ?? [],
      seenRelationIds: [
        ...(state.politicalDashboard?.seenRelationIds ?? []),
        ...unseen,
      ],
    },
  };
}

export function buildRelationGroups(
  state: Pick<CampaignState, "politicalDashboard">,
  config: RelationsConfig,
  unseenIds: string[] = getUnseenRelationIds(state),
): RelationGroupView[] {
  const relations = config.politicalConfig?.relations ?? [];
  const changed = state.politicalDashboard?.relations ?? {};
  return (config.politicalConfig?.relationGroups ?? [])
    .map((group) => ({
      ...group,
      relations: relations
        .filter((r) => r.groupId === group.id)
        .map((relation): RelationView => {
          const current = changed[relation.id];
          return {
            id: relation.id,
            name: relation.name,
            icon: relation.icon,
            tone: current?.tone ?? relation.tone,
            label: current?.label ?? relation.label,
            description: current?.description ?? relation.description,
            isNew: unseenIds.includes(relation.id),
          };
        }),
    }))
    .filter((group) => group.relations.length > 0);
}
