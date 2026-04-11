import { useState, useEffect } from "react";
import { App } from "./App";
import type { GameStateEngine, MenuStateMachine } from "./logic/application";
import { GameStateContext } from "./util/GameStateContext";

export function AppRoot({
  gameStateEngine,
  menuStateMachine,
}: {
  gameStateEngine: GameStateEngine;
  menuStateMachine: MenuStateMachine;
}) {
  const [menuState, setMenuState] = useState(() =>
    menuStateMachine.getCurrentScreen(),
  );
  const [gameState, setGameState] = useState(() =>
    gameStateEngine.getGameState(),
  );

  useEffect(() => {
    return (
      gameStateEngine.subscribe(setGameState),
      menuStateMachine.subscribe(setMenuState)
    );
  }, [gameStateEngine, menuStateMachine]);

  return (
    <GameStateContext.Provider value={{ ...menuState, ...gameState }}>
      <App gameState={gameState} menuState={menuState} />
    </GameStateContext.Provider>
  );
}
