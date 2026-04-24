import { Outlet } from "react-router-dom";
import { MainGameScreen } from "./components/ui/gameplay/MainGameScreen";
import FullscreenBackground from "./ui/Background";
import { container } from "tsyringe";
import { GameStateEngine } from "./logic/application";
import { useEffect } from "react";
import { useParams } from "./hooks/useParamsHook";
import { createLogger } from "./logic/logger";
import { NavigationBinder } from "./logic/application/navigation/NavigationBinder";

const log = createLogger("AppLayout");

export function RootLayout() {
  return (
    <FullscreenBackground>
      <NavigationBinder />
      <Outlet />
    </FullscreenBackground>
  );
}

export function MainGameScreenWrapper() {
  const { campaignId } = useParams();
  const gameStateEngine = container.resolve(GameStateEngine);

  useEffect(() => {
    if (!campaignId) {
      log.debug("No active campaign id was found");
      return;
    }

    gameStateEngine.updateGameState({ activeCampaignId: campaignId });
  }, [campaignId, gameStateEngine]);

  return <MainGameScreen campaignId={campaignId!} />;
}

export function NewGameLayout() {
  return <Outlet />;
}
