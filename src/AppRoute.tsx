import { useState, useEffect } from "react";
import { App } from "./App";
import type { GameStateEngine } from "./logic/application";
import { GameStateContext } from "./util/GameStateContext";

export function AppRoot({
  gameStateEngine,
}: {
  gameStateEngine: GameStateEngine;
}) {
  const [gameState, setGameState] = useState(() =>
    gameStateEngine.getGameState(),
  );

  useEffect(() => {
    return gameStateEngine.subscribe(setGameState);
  }, [gameStateEngine]);

  return (
    <GameStateContext.Provider value={gameState}>
      <App gameState={gameState} />
    </GameStateContext.Provider>
  );
}
