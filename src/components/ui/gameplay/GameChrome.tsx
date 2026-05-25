import type { ReactNode, ActionDispatch } from "react";
import { useNavigation } from "../../../hooks/navigationHook";
import { useDialogState } from "./hooks/useDialogState";
import { TopMenuBar } from "./GameMenuBar";
import { GameDialogs } from "./GameDialogs";
import type { GameFlowAction } from "./hooks/useGameFlow";
import type { CampaignState } from "@/logic/domain";
import type { CampaignConfig } from "@/logic/types";

interface GameChromeProps {
  children: ReactNode;
  actionDispatch?: ActionDispatch<[action: GameFlowAction]>;
  state?: CampaignState;
  config?: CampaignConfig;
}

export function GameChrome({
  children,
  actionDispatch,
  state,
  config,
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
