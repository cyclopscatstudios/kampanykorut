import { useElectionState } from "@/logic/application";
import { AdvisorModal } from "./AdvisorModal";
import { GameChrome } from "./GameChrome";
import { GameView } from "./GameView";
import { useGameFlow } from "./hooks/useGameFlow";

export type CurrentView = "MapView" | "QuestionView";

export function MainGameScreen({ campaignId }: { campaignId: string }) {
  const { state, config, processAnswer, commitTurn, getFinalResults } =
    useElectionState(campaignId);
  const { flow, dispatch, handleAnswer, handleAdvisorClose } = useGameFlow(
    processAnswer,
    commitTurn,
  );

  return (
    <GameChrome actionDispatch={dispatch} state={state} config={config}>
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
    </GameChrome>
  );
}
