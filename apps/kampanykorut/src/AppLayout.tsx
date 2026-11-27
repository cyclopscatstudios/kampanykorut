import { StateEngine, useStateEngine } from "@logic/application";
import { useGetCampaigns } from "@logic/application/hooks/useGetCampaigns";
import { useSeason } from "@logic/application/hooks/useSeason";
import { Navigation } from "@logic/application/navigation/Navigation";
import { NavigationBinder } from "@logic/application/navigation/NavigationBinder";
import { getDataPath } from "@logic/application/PathResolver";
import { usePlayTimeTracking } from "@logic/application/playTime/usePlayTimeTracking";
import { getSeasonalBackground } from "@logic/application/season/season";
import { createLogger } from "@shared/logger/logger";
import { useEffect } from "react";
import { Outlet, ScrollRestoration, useLoaderData } from "react-router-dom";
import { container } from "tsyringe";
import { GAME_HEADER_SLOT_ID } from "./components/ui/gameplay/gameHeaderSlot";
import { MainGameScreen } from "./components/ui/gameplay/MainGameScreen";
import { WarningScreen } from "./components/ui/warning/WarningScreen";
import { useParams } from "./hooks/useParamsHook";
import FullscreenBackground from "./ui/Background";

const log = createLogger("AppLayout");

const environment = import.meta.env.VITE_ENVIRONMENT;

export function ScrollLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

export function RootLayout() {
  const path = useLoaderData() as string;
  const season = useSeason();
  const background = getSeasonalBackground(
    path,
    getDataPath("background"),
    season,
  );
  const stateEngine = container.resolve(StateEngine);
  const navigation = container.resolve(Navigation);
  const { campaignId } = useParams();
  const campaignLabel = useGetCampaigns().find(
    (c) => c.id === campaignId,
  )?.label;
  usePlayTimeTracking();

  useEffect(() => {
    if (!campaignLabel) {
      return;
    }
    const previous = document.title;
    document.title = `${campaignLabel} – Kampánykörút`;
    return () => {
      document.title = previous;
    };
  }, [campaignLabel]);

  useEffect(() => {
    if (!navigation.isUrlParamMatch("/game")) {
      // stateEngine.cleanupUnsavedStates();
    }
  }, [navigation, stateEngine]);

  return (
    <div className="relative flex flex-col w-screen h-dvh bg-[#0f172a]">
      <WarningScreen
        allowWarning={environment === "dev"}
        label="Development Version"
        children={
          <a
            href="https://kampanykorut.hu/"
            className="font-bold text-white underline"
          >
            https://kampanykorut.hu/
          </a>
        }
        description="This version is for testing and may be unstable. If you arrived here
          by accident, use the stable version instead:"
        id="development-warning"
      />
      <div id={GAME_HEADER_SLOT_ID} />
      <div className="flex-1 min-h-0">
        <FullscreenBackground path={background} winter={season === "winter"}>
          <NavigationBinder />
          <Outlet />
        </FullscreenBackground>
      </div>
    </div>
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
