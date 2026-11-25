import {
  Answer,
  CampaignState,
  GAME_MODES,
  GameMode,
  GameModeScoped,
  PoliticalConfig,
} from "@shared/types";

type ModeConfig = Pick<PoliticalConfig, "gameMode" | "gameModes">;

export function getAvailableGameModes(
  politicalConfig?: ModeConfig,
): GameMode[] {
  const listed = politicalConfig?.gameModes;
  if (listed?.length) {
    return GAME_MODES.filter((mode) => listed.includes(mode));
  }
  return [politicalConfig?.gameMode ?? "classic"];
}

// A side playable in both modes starts in classic unless the player opts in.
export function getDefaultGameMode(politicalConfig?: ModeConfig): GameMode {
  const modes = getAvailableGameModes(politicalConfig);
  return modes.includes("classic") ? "classic" : modes[0];
}

export function resolveGameMode(
  requested: GameMode | undefined,
  politicalConfig?: ModeConfig,
): GameMode {
  return requested && getAvailableGameModes(politicalConfig).includes(requested)
    ? requested
    : getDefaultGameMode(politicalConfig);
}

export function getStateGameMode(
  state: Pick<CampaignState, "gameMode"> | null | undefined,
  politicalConfig?: ModeConfig,
): GameMode {
  return resolveGameMode(state?.gameMode, politicalConfig);
}

export function isInGameMode(item: GameModeScoped, mode: GameMode): boolean {
  return !item.gameModes?.length || item.gameModes.includes(mode);
}

export function filterByGameMode<T extends GameModeScoped>(
  items: T[],
  mode: GameMode,
): T[] {
  return items.filter((item) => isInGameMode(item, mode));
}

const STRATEGIC_EFFECT_TYPES = new Set<string>([
  "issue-stance",
  "set-relation",
  "shift-relation",
]);

export function effectsForGameMode<T extends GameModeScoped & { type: string }>(
  effects: T[],
  mode: GameMode,
): T[] {
  return effects.filter(
    (effect) =>
      isInGameMode(effect, mode) &&
      (mode === "strategic" || !STRATEGIC_EFFECT_TYPES.has(effect.type)),
  );
}

export function answerForGameMode(answer: Answer, mode: GameMode): Answer {
  return {
    ...answer,
    effects: effectsForGameMode(answer.effects, mode),
    ...(answer.conditionalEffects && {
      conditionalEffects: filterByGameMode(answer.conditionalEffects, mode).map(
        (conditional) => ({
          ...conditional,
          effects: effectsForGameMode(conditional.effects, mode),
        }),
      ),
    }),
  };
}
