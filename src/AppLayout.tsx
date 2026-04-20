import { Outlet, useParams } from "react-router-dom";
import { MainGameScreen } from "./components/ui/gameplay/MainGameScreen";
import FullscreenBackground from "./ui/Background";
import { container } from "tsyringe";
import { GameStateEngine } from "./logic/application";
import { useEffect } from "react";

export function RootLayout() {
  return (
    <FullscreenBackground>
      <Outlet />
    </FullscreenBackground>
  );
}

export function MainGameScreenWrapper() {
  const { id } = useParams();
  const gameStateEngine = container.resolve(GameStateEngine);

  useEffect(() => {
    if (!id) return;

    gameStateEngine.updateGameState({ activeGameId: id });
  }, [id, gameStateEngine]);

  return <MainGameScreen gameId={id!} />;
}

export function NewGameLayout() {
  return <Outlet />;
}
