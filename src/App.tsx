import { MainGameScreen } from "./components/ui/gameplay/MainGameScreen";
import { MenuSelector } from "./components/ui/menu/MenuSelector";
import type { GameState } from "./logic/application";
import FullscreenBackground from "./ui/Background";

type AppProps = {
  gameState: GameState;
};

export function App({ gameState }: AppProps) {
  console.log({ gameState });
  switch (gameState.currentScreen) {
    case "MenuSelector":
      return (
        <FullscreenBackground>
          <MenuSelector />
        </FullscreenBackground>
      );

    case "MapCreator":
      return (
        <FullscreenBackground>
          <MainGameScreen gameId={gameState.activeGameId!} />
        </FullscreenBackground>
      );

    default:
      return null;
  }
}
