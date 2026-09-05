import { t } from "i18next";
import { useEffect } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import { container } from "tsyringe";
import { useMediaQuery } from "usehooks-ts";
import { createLogger } from "@/shared/logger/logger";
import { GAME_HEADER_SLOT_ID } from "./components/ui/gameplay/gameHeaderSlot";
import { MainGameScreen } from "./components/ui/gameplay/MainGameScreen";
import { WarningScreen } from "./components/ui/warning/WarningScreen";
import { useParams } from "./hooks/useParamsHook";
import { StateEngine, useStateEngine } from "./logic/application";
import { Navigation } from "./logic/application/navigation/Navigation";
import { NavigationBinder } from "./logic/application/navigation/NavigationBinder";
import FullscreenBackground from "./ui/Background";

const log = createLogger("AppLayout");

const environment = import.meta.env.VITE_ENVIRONMENT;

export function RootLayout() {
  const path = useLoaderData();
  const stateEngine = container.resolve(StateEngine);
  const navigation = container.resolve(Navigation);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (!navigation.isUrlParamMatch("/game")) {
      stateEngine.cleanupUnsavedStates();
    }
  }, [navigation, stateEngine]);

  return (
    <div className="relative flex flex-col w-screen h-screen bg-[#0f172a]">
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
      />
      <WarningScreen
        allowWarning={!isDesktop}
        label={t("warning.lowResolution.label")}
        description={t("warning.lowResolution.description")}
      />
      <div id={GAME_HEADER_SLOT_ID} />
      <div className="flex-1 min-h-0">
        <FullscreenBackground path={path}>
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
