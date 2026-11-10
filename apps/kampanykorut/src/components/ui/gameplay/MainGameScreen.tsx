import { useEffect, useMemo, useState } from "react";
import { container } from "tsyringe";
import { StateEngine, useElectionState } from "@/logic/application";
import {
  buildNewspaperEditions,
  getPendingAnnouncement,
  hasUnreadEdition,
  isIntroPending,
  PollsterEngine,
  shouldOpenEdition,
} from "@/shared/domain";
import { createLogger } from "@/shared/logger";
import { CampaignConfig, CampaignState, CurrentView } from "@/shared/types";
import { useSettings } from "../../../logic/application/hooks/useSettings";
import {
  getLoadDurationBucket,
  getRunProperties,
} from "../../../logic/infra/posthog/events";
import { takeCampaignLoadDuration } from "../../../logic/infra/posthog/loadTiming";
import { trackOnce } from "../../../logic/infra/posthog/track";
import { CampaignIntroDialog } from "../campaignIntro/CampaignIntroDialog";
import { NewspaperButton } from "../newspaper/NewspaperButton";
import { NewspaperDialog } from "../newspaper/NewspaperDialog";
import { AdvisorModal } from "./AdvisorModal";
import { EventAnnouncementDialog } from "./EventAnnouncementDialog";
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
    acknowledgeAnnouncement,
    markNewspaperRead,
    markIntroSeen,
    getMapDataByPolls,
  } = useElectionState(campaignId);
  const { settings, updateSettings } = useSettings();
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
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
  const isIntroOpen = isIntroPending(state, config.electionConfig);
  // Announcements and the newspaper only come up on the map, so they never
  // collide with the advisor feedback that may follow an answer.
  const pendingAnnouncement =
    !state.isEnded &&
    !flow.pendingAdvisor &&
    !isIntroOpen &&
    flow.currentView === "MapView"
      ? getPendingAnnouncement(state, config.campaignEvents)
      : undefined;

  const editions = useMemo(
    () => buildNewspaperEditions(state, config),
    [state, config],
  );
  const hasUnreadPaper = hasUnreadEdition(state);
  const autoOpenPaper = settings.newspaperAutoOpen !== false;
  const isArrivalOpen =
    autoOpenPaper &&
    shouldOpenEdition(state) &&
    !isArchiveOpen &&
    !state.isEnded &&
    !flow.pendingAdvisor &&
    !pendingAnnouncement &&
    !isIntroOpen &&
    flow.currentView === "MapView";

  const openArchive = () => {
    setIsArchiveOpen(true);
    markNewspaperRead();
  };

  const optOutOfPaper = () => {
    updateSettings({ newspaperAutoOpen: false });
    markNewspaperRead();
  };

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

    const polls = pollsterEngine.getPollsByPollsterId(id, state);

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
      <CampaignIntroDialog
        open={isIntroOpen}
        intro={config.electionConfig.intro}
        fallbackTitle={config.electionConfig.title}
        onConfirm={markIntroSeen}
      />
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
      <EventAnnouncementDialog
        announcement={pendingAnnouncement?.announcement}
        onClose={() =>
          pendingAnnouncement &&
          acknowledgeAnnouncement(pendingAnnouncement.eventId)
        }
      />
      <NewspaperDialog
        open={isArrivalOpen || isArchiveOpen}
        mode={isArchiveOpen ? "archive" : "arrival"}
        editions={editions}
        year={config.electionConfig.year}
        onRead={markNewspaperRead}
        onOptOut={optOutOfPaper}
        onClose={() => setIsArchiveOpen(false)}
      />
      <GameView
        mapOverlay={
          editions.length > 0 ? (
            <NewspaperButton
              hasUnread={hasUnreadPaper}
              ribbon={
                (!autoOpenPaper || !shouldOpenEdition(state)) && hasUnreadPaper
                  ? editions[editions.length - 1].item.headline
                  : undefined
              }
              onOpen={openArchive}
            />
          ) : undefined
        }
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
