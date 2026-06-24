import { container } from "tsyringe";
import { StateEngine, useElectionState } from "@/logic/application";
import { PollsterEngine } from "@/shared/domain";
import { createLogger } from "@/shared/logger";
import { CampaignConfig, CampaignState, CurrentView } from "@/shared/types";
import { AdvisorModal } from "./AdvisorModal";
import { GameChrome } from "./GameChrome";
import { GameView } from "./GameView";
import { useGameFlow } from "./hooks/useGameFlow";

const log = createLogger("MainGameScreen");

export function MainGameScreen({ campaignId }: { campaignId: string }) {
  const pollsterEngine = container.resolve(PollsterEngine);
  const stateEngine = container.resolve(StateEngine);
  const {
    state,
    config,
    processAnswer,
    commitTurn,
    getFinalResults,
    getMapDataByPolls,
  } = useElectionState(campaignId);
  const { flow, dispatch, handleAnswer, handleAdvisorClose } = useGameFlow(
    processAnswer,
    commitTurn,
  );

  const handlePollsterChange = (
    id: string,
    state?: CampaignState,
    config?: CampaignConfig,
  ) => {
    if (!state || !config) {
      return;
    }

    const polls = pollsterEngine.getPollsByPollsterId(
      id,
      state,
      config.electionConfig,
    );

    log.debug("Changing map view to pollster data", { pollsterId: id });
    getMapDataByPolls(state, config.electionConfig, polls?.differences, id);
  };

  const handleView = (view: CurrentView) => {
    dispatch({ type: "CHANGE_VIEW", view });
    stateEngine.updateCampaignState({ campaignView: { type: view } });
  };

  return (
    <GameChrome
      actionDispatch={dispatch}
      state={state}
      config={config}
      pollsterData={state.pollingOpnions ?? null}
      handlePollsterChange={handlePollsterChange}
      flow={flow}
    >
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
        pollsData={state.pollingOpnions ?? null}
        config={config}
        answer={flow.answer}
        selectedDistrict={flow.selectedDistrict}
        getFinalResults={getFinalResults}
        onAnswer={handleAnswer}
        onSetAnswer={(answer) => dispatch({ type: "SET_ANSWER", answer })}
        onSetView={handleView}
        onSetDistrict={(district) =>
          dispatch({ type: "SELECT_DISTRICT", district })
        }
      />
    </GameChrome>
  );
}
