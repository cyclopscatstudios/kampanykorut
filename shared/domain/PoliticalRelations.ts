import {
  CampaignConfig,
  CampaignState,
  RelationGroup,
  RelationStanding,
  SetRelationEffect,
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

export function setRelations(
  state: CampaignState,
  effects: SetRelationEffect[],
): CampaignState {
  if (effects.length === 0) {
    return state;
  }
  const relations = { ...state.politicalDashboard?.relations };
  for (const { relationId, tone, label, description } of effects) {
    relations[relationId] = {
      tone,
      label,
      description,
      changedAtTurn: state.turn,
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
