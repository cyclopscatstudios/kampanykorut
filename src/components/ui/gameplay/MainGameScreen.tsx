import { useElectionState } from "@/logic/application";
import { AdvisorModal } from "./AdvisorModal";
import { GameMenuBar } from "./GameMenuBar";
import { GameDialogs } from "./GameDialogs";
import { GameView } from "./GameView";
import { useNavigation } from "../../../hooks/navigationHook";
import { useDialogState } from "./hooks/useDialogState";
import { useGameFlow } from "./hooks/useGameFlow";

export type CurrentView = "MapView" | "QuestionView" | "FinalScreen";

export function MainGameScreen({ campaignId }: { campaignId: string }) {
  const { state, config, processAnswer, commitTurn, getFinalResults } =
    useElectionState(campaignId);
  const dialogs = useDialogState();
  const { flow, dispatch, handleAnswer, handleAdvisorClose } = useGameFlow(
    processAnswer,
    commitTurn,
  );
  const { goToMainMenu } = useNavigation();

  return (
    <div className="w-full h-full">
      <GameMenuBar activeDialog={dialogs.activeDialog} onOpen={dialogs.open} actionDispatch={dispatch} />
      <GameDialogs
        activeDialog={dialogs.activeDialog}
        onClose={dialogs.close}
        onConfirmExit={() => {
          dialogs.close();
          goToMainMenu();
        }}
      />
      <AdvisorModal
        advice={flow.pendingAdvisor?.feedback.text ?? ""}
        open={Boolean(flow.pendingAdvisor)}
        onClose={handleAdvisorClose}
        asset={{
          primaryAdvisorImageUri:
            config.advisorFeedbackAssets?.primaryAdvisorImageUri ?? "",
          secondaryAdvisorImageUri:
            config.advisorFeedbackAssets?.secondaryAdvisorImageUri ?? "",
        }}
      />
      <GameView
        currentView={flow.currentView}
        state={state}
        config={config}
        answer={flow.answer}
        selectedDistrict={flow.selectedDistrict}
        getFinalResults={getFinalResults}
        onAnswer={handleAnswer}
        onSetAnswer={(answer) => dispatch({ type: "SET_ANSWER", answer })}
        onSetView={(view) => dispatch({ type: "CHANGE_VIEW", view })}
        onSetDistrict={(district) =>
          dispatch({ type: "SELECT_DISTRICT", district })
        }
      />
    </div>
  );
}
