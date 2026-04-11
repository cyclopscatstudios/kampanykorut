import { MainGameScreen } from "./components/ui/gameplay/MainGameScreen";
import { MenuSelector } from "./components/ui/menu/MenuSelector";
import type { GameState, MenuState } from "./logic/application";
import FullscreenBackground from "./ui/Background";

type AppProps = {
  gameState: GameState;
  menuState: MenuState;
};

export function App({ gameState, menuState }: AppProps) {
  console.log({ gameState, menuState });
  switch (menuState.screenType) {
    case "menuScreen":
      return (
        <FullscreenBackground>
          <MenuSelector />
        </FullscreenBackground>
      );

    case "gameScreen":
      return (
        <FullscreenBackground>
          <MainGameScreen gameId={gameState.activeGameId!} />
        </FullscreenBackground>
      );

    default:
      return null;
  }
}
