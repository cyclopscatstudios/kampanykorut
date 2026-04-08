import { container } from "tsyringe";
import { GameConfigEngine } from "../GameConfigEngine";
import { useEffect, useState } from "react";

export function useGameConfigEngine() {
  const engine = container.resolve(GameConfigEngine);
  const [gameConfig, setGameConfig] = useState(() =>
    engine.isConfigured() ? engine.getElectionConfig() : null,
  );

  useEffect(() => {
    return engine.subscribe(setGameConfig);
  }, [engine]);

  return { gameConfig };
}
