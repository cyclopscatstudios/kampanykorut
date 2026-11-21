import type { ReactNode } from "react";
import { CampaignConfig, CampaignState, PollingOpnions } from "@/shared/types";
import { CheatPanel } from "../../../debug/cheat/CheatPanel";
import { useNavigation } from "../../../hooks/navigationHook";
import { GameDialogs } from "./GameDialogs";
import { GameHeader } from "./GameHeader";
import { useDialogState } from "./hooks/useDialogState";

interface GameChromeProps {
  children: ReactNode;
  state?: CampaignState;
  config?: CampaignConfig;
  pollsterData?: PollingOpnions | null;
  handlePollsterChange?: (
    id: string,
    state?: CampaignState,
    config?: CampaignConfig,
  ) => void;
  onResumeQuestion?: () => void;
}

export function GameChrome({
  children,
  state,
  config,
  pollsterData,
  handlePollsterChange,
  onResumeQuestion,
}: GameChromeProps) {
  const dialogs = useDialogState();
  const { goToMainMenu } = useNavigation();

  return (
    <>
      <GameHeader
        activeDialog={dialogs.activeDialog}
        onOpen={dialogs.open}
        state={state}
        config={config}
        pollsterData={pollsterData}
        handlePollsterChange={handlePollsterChange}
        onResumeQuestion={onResumeQuestion}
      />
      <GameMain>
        <GameDialogs
          activeDialog={dialogs.activeDialog}
          onClose={dialogs.close}
          onConfirmExit={() => {
            dialogs.close();
            goToMainMenu();
          }}
        />
        {children}
      </GameMain>
      <CheatPanel state={state} />
    </>
  );
}

function GameMain({ children }: { children: ReactNode }) {
  return <main className="w-full h-full flex flex-col">{children}</main>;
}
