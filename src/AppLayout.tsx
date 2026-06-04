import { useEffect } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import { createLogger } from "../shared/logger/logger";
import { MainGameScreen } from "./components/ui/gameplay/MainGameScreen";
import { useParams } from "./hooks/useParamsHook";
import { useStateEngine } from "./logic/application";
import { NavigationBinder } from "./logic/application/navigation/NavigationBinder";
import FullscreenBackground from "./ui/Background";

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
  }, [saveSession, campaignId]);

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
