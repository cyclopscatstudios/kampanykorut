import { Outlet, useLoaderData } from "react-router-dom";
import { MainGameScreen } from "./components/ui/gameplay/MainGameScreen";
import FullscreenBackground from "./ui/Background";
import { useStateEngine } from "./logic/application";
import { useEffect } from "react";
import { useParams } from "./hooks/useParamsHook";
import { createLogger } from "./logic/logger";
import { NavigationBinder } from "./logic/application/navigation/NavigationBinder";

const log = createLogger("AppLayout");

export function RootLayout() {
  const path = useLoaderData();
  return (
    <FullscreenBackground path={path}>
      <NavigationBinder />
      <Outlet />
    </FullscreenBackground>
  );
}

export function MainGameScreenWrapper() {
  const { campaignId } = useParams();
  const { saveSession } = useStateEngine();

  useEffect(() => {
    if (!campaignId) {
      log.debug("No active campaign id was found");
      return;
    }

    saveSession("campaignState", { activeCampaignId: campaignId });
  }, [campaignId]);

  return (
    <>
      <MainGameScreen campaignId={campaignId!} />
      <Outlet />
    </>
  );
}

export function NewGameLayout() {
  return <Outlet />;
}
