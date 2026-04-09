import { container } from "tsyringe";
import { GameConfigEngine } from "../GameConfigEngine";
import { useEffect, useState } from "react";
import type { ElectionConfig } from "../../types/campaignEngine.types";

export function useGameConfigEngine() {
  const engine = container.resolve(GameConfigEngine);
  const [gameConfig, setGameConfig] = useState(() =>
    engine.isConfigured() ? engine.getElectionConfig() : null,
  );

  useEffect(() => {
    return engine.subscribe(setGameConfig);
  }, [engine]);

  return {
    gameConfig,
    updateGameConfig: (config: Partial<ElectionConfig>) =>
      engine.updateGameConfig(config),
  };
}
