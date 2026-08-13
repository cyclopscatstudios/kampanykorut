import { useEffect, useState } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import { container } from "tsyringe";
import { createLogger } from "@/shared/logger/logger";
import { Icon, Text } from "@/shared/ui";
import { GAME_HEADER_SLOT_ID } from "./components/ui/gameplay/gameHeaderSlot";
import { MainGameScreen } from "./components/ui/gameplay/MainGameScreen";
import { useParams } from "./hooks/useParamsHook";
import { StateEngine, useStateEngine } from "./logic/application";
import { Navigation } from "./logic/application/navigation/Navigation";
import { NavigationBinder } from "./logic/application/navigation/NavigationBinder";
import FullscreenBackground from "./ui/Background";

const log = createLogger("AppLayout");

const environment = import.meta.env.VITE_ENVIRONMENT;

export function RootLayout() {
  const [showWarningScreen, setShowWarningScreen] = useState(true);
  const path = useLoaderData();
  const stateEngine = container.resolve(StateEngine);
  const navigation = container.resolve(Navigation);

  useEffect(() => {
    if (!navigation.isUrlParamMatch("/game")) {
      stateEngine.cleanupUnsavedStates();
    }
  }, [navigation, stateEngine]);

  return (
    <div className="relative flex flex-col w-screen h-screen bg-[#0f172a]">
      {environment === "dev" && showWarningScreen && (
        <WarningScreen onClose={() => setShowWarningScreen(false)} />
      )}
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

function WarningScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-0 left-0 z-50 w-full">
      <div className="relative border-2 border-yellow-400 bg-gray-800/80 p-4 text-center">
        <Text weight="bold">⚠️ Development Version</Text>
        <Text>
          This version is for testing and may be unstable. If you arrived here
          by accident, use the stable version instead:
        </Text>
        <a
          href="https://kampanykorut.hu/"
          className="font-bold text-white underline"
        >
          https://kampanykorut.hu/
        </a>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-8 cursor-pointer"
          aria-label="Close development warning"
        >
          <Icon name="x-circle" size="large" />
        </button>
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
