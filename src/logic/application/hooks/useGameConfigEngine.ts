import { GameConfigEngine } from "../GameConfigEngine";
import { useEffect, useState } from "react";

export function useGameConfigEngine(engine: GameConfigEngine | null) {
  const [trackedEngine, setTrackedEngine] = useState(engine);
  const [gameConfig, setGameConfig] = useState(
    () => engine?.getElectionConfig() ?? null,
  );

  if (trackedEngine !== engine) {
    setTrackedEngine(engine);
    setGameConfig(engine?.getElectionConfig() ?? null);
  }

  useEffect(() => {
    if (!engine) {
      return;
    }
    return engine.subscribe(setGameConfig);
  }, [engine]);

  return { gameConfig };
}
