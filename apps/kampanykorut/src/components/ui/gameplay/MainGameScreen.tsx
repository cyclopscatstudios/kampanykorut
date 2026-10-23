import { useEffect, useMemo } from "react";
import { container } from "tsyringe";
import { StateEngine, useElectionState } from "@/logic/application";
import { PollsterEngine } from "@/shared/domain";
import { createLogger } from "@/shared/logger";
import { CampaignConfig, CampaignState, CurrentView } from "@/shared/types";
import {
  getLoadDurationBucket,
  getRunProperties,
} from "../../../logic/infra/posthog/events";
import { takeCampaignLoadDuration } from "../../../logic/infra/posthog/loadTiming";
import { trackOnce } from "../../../logic/infra/posthog/track";
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
    finishCampaign,
    getMapDataByPolls,
  } = useElectionState(campaignId);
  const { flow, dispatch, handleAnswer, handleAdvisorClose } = useGameFlow(
    processAnswer,
    commitTurn,
  );
  const sessionId = stateEngine.getSessionId();
  const partyId = state.playerSide?.partyId;
  const candidateId = state.playerSide?.candidateId;
  const runProperties = useMemo(
    () => getRunProperties(sessionId, campaignId, { partyId, candidateId }),
    [sessionId, campaignId, partyId, candidateId],
  );
  const isResumed = state.turn > 0;

  useEffect(() => {
    const loadDuration = takeCampaignLoadDuration();
    trackOnce(runProperties.run_id, "campaign_loaded", {
      ...runProperties,
      resumed: isResumed,
      load_ms_bucket:
        loadDuration === undefined
          ? undefined
          : getLoadDurationBucket(loadDuration),
    });
  }, [runProperties, isResumed]);

  useEffect(() => {
    if (flow.currentView === "QuestionView" && state.turn === 0) {
      trackOnce(runProperties.run_id, "first_question_viewed", runProperties);
    }
  }, [flow.currentView, state.turn, runProperties]);

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
      state={state}
      config={config}
      pollsterData={state.pollingOpnions ?? null}
      handlePollsterChange={handlePollsterChange}
    >
      <div className="flex w-full h-[5px] overflow-hidden">
        {config.electionConfig.parties.map((party) => (
          <div
            key={party.id}
            className="flex-1"
            style={{ backgroundColor: party.color }}
            title={party.name}
          />
        ))}
      </div>
      <AdvisorModal
        advice={flow.pendingAdvisor?.feedback.text ?? ""}
        open={Boolean(flow.pendingAdvisor)}
        onClose={handleAdvisorClose}
        asset={
          config.playableSides?.[state.playerSide?.partyId ?? ""]?.[
            state.playerSide?.candidateId ?? ""
          ]?.advisorFeedbackAssets
        }
      />
      <GameView
        currentView={flow.currentView}
        state={state}
        pollsData={state.pollingOpnions ?? null}
        config={config}
        answer={flow.answer}
        selectedDistrict={flow.selectedDistrict}
        onAnswer={handleAnswer}
        onSetAnswer={(answer) => dispatch({ type: "SET_ANSWER", answer })}
        onSetView={handleView}
        onSetDistrict={(district) =>
          dispatch({ type: "SELECT_DISTRICT", district })
        }
        onVoteCountingComplete={finishCampaign}
      />
    </GameChrome>
  );
}
