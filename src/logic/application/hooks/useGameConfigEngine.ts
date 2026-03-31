import { useEngine } from "./useEngine";
import { GameConfigEngine } from "../ElectionConfigEngine";
import { useEffect, useState } from "react";

export function useGameConfigEngine() {
  const gameConfigEngine = useEngine(GameConfigEngine);

  const [trackedEngine, setTrackedEngine] = useState(gameConfigEngine);
  const [gameConfig, setGameConfig] = useState(() =>
    gameConfigEngine.getElectionConfig(),
  );

  if (trackedEngine !== gameConfigEngine) {
    setTrackedEngine(gameConfigEngine);
    setGameConfig(gameConfigEngine.getElectionConfig());
  }

  useEffect(() => {
    return gameConfigEngine.subscribe(setGameConfig);
  }, [gameConfigEngine]);

  return {
    gameConfig,
  };
}
