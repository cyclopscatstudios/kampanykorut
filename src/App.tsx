import "./App.css";
import FullscreenBackground from "./ui/Background";
import { MenuSelector } from "./components/ui/menu/MenuSelector";
import { useEffect, useState } from "react";
import { MainGameScreen } from "./components/ui/gameplay/MainGameScreen";
import { container } from "tsyringe";
import {
  GameStateEngine,
  type GameState,
} from "./logic/application/GameStateEngine";

export type ScreenType = "MenuSelector" | "MapCreator";

const gameStateEngine = container.resolve(GameStateEngine);

function App() {
  const [gameState, setGameState] = useState<GameState>(() =>
    gameStateEngine.getGameState(),
  );

  useEffect(() => {
    return gameStateEngine.subscribe(setGameState);
  }, []);

  return (
    <FullscreenBackground>
      {gameState.currentScreen === "MenuSelector" ? (
        <MenuSelector />
      ) : (
        <MainGameScreen gameId={gameState.activeGameId ?? ""} />
      )}
    </FullscreenBackground>
  );
}

export default App;
