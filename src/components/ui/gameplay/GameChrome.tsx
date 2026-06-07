import type { ActionDispatch, ReactNode } from "react";
import { useNavigation } from "../../../hooks/navigationHook";
import { GameDialogs } from "./GameDialogs";
import { TopMenuBar } from "./GameMenuBar";
import { useDialogState } from "./hooks/useDialogState";
import type { GameFlowAction } from "./hooks/useGameFlow";
import { CampaignConfig, CampaignState, PollingOpnions } from "@/shared/types";

interface GameChromeProps {
  children: ReactNode;
  actionDispatch?: ActionDispatch<[action: GameFlowAction]>;
  state?: CampaignState;
  config?: CampaignConfig;
  pollsterData: PollingOpnions | null;
  handlePollsterChange?: any;
}

export function GameChrome({
  children,
  actionDispatch,
  state,
  config,
  pollsterData,
  handlePollsterChange,
}: GameChromeProps) {
  const dialogs = useDialogState();
  const { goToMainMenu } = useNavigation();

  return (
    <div className="w-full h-full">
      <TopMenuBar
        activeDialog={dialogs.activeDialog}
        onOpen={dialogs.open}
        actionDispatch={actionDispatch}
        state={state}
        config={config}
        pollsterData={pollsterData}
        handlePollsterChange={handlePollsterChange}
      />
      <GameDialogs
        activeDialog={dialogs.activeDialog}
        onClose={dialogs.close}
        onConfirmExit={() => {
          dialogs.close();
          goToMainMenu();
        }}
      />
      {children}
    </div>
  );
}
