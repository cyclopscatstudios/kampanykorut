import type { ActionDispatch, ReactNode } from "react";
import { CampaignConfig, CampaignState, PollingOpnions } from "@/shared/types";
import { useNavigation } from "../../../hooks/navigationHook";
import { GameDialogs } from "./GameDialogs";
import { TopMenuBar } from "./GameMenuBar";
import { useDialogState } from "./hooks/useDialogState";
import type { GameFlowAction, GameFlowState } from "./hooks/useGameFlow";

interface GameChromeProps {
  children: ReactNode;
  actionDispatch?: ActionDispatch<[action: GameFlowAction]>;
  state?: CampaignState;
  config?: CampaignConfig;
  pollsterData?: PollingOpnions | null;
  handlePollsterChange?: (
    id: string,
    state?: CampaignState,
    config?: CampaignConfig,
  ) => void;
  flow?: GameFlowState;
}

export function GameChrome({
  children,
  actionDispatch,
  state,
  config,
  pollsterData,
  handlePollsterChange,
  flow,
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
        flow={flow}
      />
      <div className="h-15.5 shrink-0" />
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
