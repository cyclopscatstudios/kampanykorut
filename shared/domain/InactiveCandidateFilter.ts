import { ConditionalRawEffect, EffectType, RawEffect } from "../types";

function omitKeys<T>(record: Record<string, T>, ids: Set<string>) {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !ids.has(key)),
  );
}

function withoutInactive(
  effect: RawEffect,
  inactive: Set<string>,
): RawEffect | null {
  switch (effect.type) {
    case EffectType.UniformSwing:
    case EffectType.TurnoutChange: {
      const params = omitKeys(effect.params, inactive);
      return Object.keys(params).length ? { ...effect, params } : null;
    }
    case EffectType.VoteAllocation: {
      const share = omitKeys(effect.params.share, inactive);
      const total = Object.values(share).reduce((sum, v) => sum + v, 0);
      if (total <= 0) {
        return null;
      }
      return {
        ...effect,
        params: {
          ...effect.params,
          share: Object.fromEntries(
            Object.entries(share).map(([key, v]) => [key, v / total]),
          ),
        },
      };
    }
    case EffectType.DistrictVoteTransfer: {
      const params = (effect.params as { targetParty: string }[]).filter(
        (target) => !inactive.has(target.targetParty),
      );
      return params.length ? ({ ...effect, params } as RawEffect) : null;
    }
    default:
      return effect;
  }
}

export function excludeInactiveCandidates(
  effects: RawEffect[],
  inactiveCandidateIds: string[],
): RawEffect[] {
  if (!inactiveCandidateIds.length) {
    return effects;
  }
  const inactive = new Set(inactiveCandidateIds);
  return effects
    .map((effect) => withoutInactive(effect, inactive))
    .filter((effect): effect is RawEffect => effect !== null);
}

export function excludeInactiveFromConditionalEffects(
  conditionalEffects: ConditionalRawEffect[] | undefined,
  inactiveCandidateIds: string[],
): ConditionalRawEffect[] | undefined {
  if (!conditionalEffects || !inactiveCandidateIds.length) {
    return conditionalEffects;
  }
  return conditionalEffects.map((conditional) => ({
    ...conditional,
    effects: excludeInactiveCandidates(
      conditional.effects,
      inactiveCandidateIds,
    ),
  }));
}
