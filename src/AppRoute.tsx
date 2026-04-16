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

  console.log({ gameState, menuState });

  useEffect(() => {
    const unsubGameState = gameStateEngine.subscribe(setGameState);
    const unsubMenuState = menuStateMachine.subscribe(setMenuState);
    return () => {
      unsubGameState();
      unsubMenuState();
    };
  }, [gameStateEngine, menuStateMachine]);

  return (
    <GameStateContext.Provider value={{ ...menuState, ...gameState }}>
      <App gameState={gameState} menuState={menuState} />
    </GameStateContext.Provider>
  );
}
