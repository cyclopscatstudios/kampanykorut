import { useState } from "react";
import { container } from "tsyringe";
import { AdvisorModal } from "./AdvisorModal";
import { GameChrome } from "./GameChrome";
import { GameView } from "./GameView";
import { useGameFlow } from "./hooks/useGameFlow";
import { useElectionState } from "@/logic/application";
import { AGGREGATE_POLLSTER_ID, PollsterEngine } from "@/shared/domain";
import { createLogger } from "@/shared/logger";
import { CampaignState, ElectionConfig, PollingOpnions } from "@/shared/types";

const log = createLogger("MainGameScreen");

export type CurrentView = "MapView" | "QuestionView";

export function MainGameScreen({ campaignId }: { campaignId: string }) {
  const pollsterEngine = container.resolve(PollsterEngine);
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
  const defaultPolls = pollsterEngine.getPollsByPollsterId(
    AGGREGATE_POLLSTER_ID,
    state,
    config.electionConfig,
  );
  const defaultPollsterData = getMapDataByPolls(
    state,
    config.electionConfig,
    defaultPolls,
  );
  const [pollsterData, setPollsterData] = useState<PollingOpnions | null>(
    defaultPollsterData ?? null,
  );

  const handlePollsterChange = (
    id: string,
    state: CampaignState,
    config: ElectionConfig,
  ) => {
    const polls = pollsterEngine.getPollsByPollsterId(id, state, config);
    const currentPollsterData = getMapDataByPolls(state, config, polls);
    if (currentPollsterData) {
      log.debug("Changing map view to pollster data", {
        pollsterId: id,
      });
      setPollsterData({ ...currentPollsterData, selectedPollsterId: id });
    }
  };

  return (
    <GameChrome
      actionDispatch={dispatch}
      state={state}
      config={config}
      pollsterData={pollsterData}
      handlePollsterChange={handlePollsterChange}
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
        pollsData={pollsterData}
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
