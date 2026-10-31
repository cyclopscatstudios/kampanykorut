import { useEffect, useMemo, useState } from "react";
import { container } from "tsyringe";
import { getParliamentaryConfig, getPlayerVoteKey } from "@/shared/domain";
import { createLogger } from "@/shared/logger";
import { StorageEngine } from "@/shared/logic/application/StorageEngine";
import {
  Answer,
  CampaignState,
  Decision,
  District,
  ElectionConfig,
  PendingTurn,
} from "@/shared/types";
import { useNavigation } from "../../../hooks/navigationHook";
import {
  getCampaignOutcome,
  getMayoralCampaignOutcome,
  getRunProperties,
} from "../../infra/posthog/events";
import { track, trackOnce } from "../../infra/posthog/track";
import { ConfigEngine } from "../ConfigEngine";
import { createCampaignEngine } from "../createCampaignEngine";
import { useSettings } from "./useSettings";
import { useStateEngine } from "./useStateEngine";

const log = createLogger("useElectionState");

export function useElectionState(campaignId: string) {
  const config = container.resolve(ConfigEngine).getCampaignConfig(campaignId);
  const { saveSession, currentState, currentHistory, sessionId } =
    useStateEngine();
  const playerSideId = currentState?.playerSide?.partyId;
  const playerCandidateId = currentState?.playerSide?.candidateId;
  const { campaignEngine } = useMemo(
    () =>
      createCampaignEngine(config, campaignId, playerSideId, playerCandidateId),
    [config, campaignId, playerSideId, playerCandidateId],
  );
  const [gameState, setGameState] = useState<CampaignState>(() => {
    const isResumed = Boolean(currentState?.turn);
    log.info(isResumed ? "Resuming campaign" : "Starting new campaign", {
      campaignId,
      sessionId,
      turn: currentState?.turn,
      historyLength: currentHistory?.length ?? 0,
      playerSideId,
      playerCandidateId,
    });
    try {
      return campaignEngine.createInitialState(
        campaignId,
        currentState,
        config.electionConfig,
        playerSideId,
        config.version,
      );
    } catch (error) {
      track("campaign_load_failed", {
        campaign_id: campaignId,
        stage: "state",
      });
      log.error("Failed to create initial campaign state", {
        error,
        campaignId,
        sessionId,
        isResumed,
        turn: currentState?.turn,
        playerSideId,
        playerCandidateId,
      });
      throw error;
    }
  });
  const runProperties = getRunProperties(
    sessionId,
    campaignId,
    gameState.playerSide,
  );
  const { settings } = useSettings();
  const { goToFinalResults } = useNavigation();

  useEffect(() => {
    saveSession("campaignState", gameState);
  }, [campaignEngine.createInitialState]);

  const processAnswer = (
    rawAnswer?: string,
    selectedDistrict?: District | null,
  ): PendingTurn | undefined => {
    const answer = getAnswer(gameState?.answerEffects, rawAnswer);
    if (!rawAnswer || !gameState.currentQuestion || !answer?.effects) {
      return;
    }

    const decision: Decision = {
      answerId: rawAnswer,
      questionId: gameState.currentQuestion?.id,
      effects: answer.effects,
      conditionalEffects: answer.conditionalEffects,
      selectedDistrict,
    };
    let newGameState: CampaignState;
    try {
      newGameState = campaignEngine.processTurn(
        gameState,
        decision,
        currentHistory ?? [],
        settings,
        config.electionConfig,
        playerSideId && playerCandidateId
          ? config.playableSides?.[playerSideId]?.[playerCandidateId]
              ?.campaignStrategies
          : undefined,
        config.electionConfig.districtBoost,
        getPlayerVoteKey(config.electionConfig, gameState.playerSide),
      );
    } catch (error) {
      log.error("Failed to process turn", {
        error,
        campaignId,
        sessionId,
        turn: gameState.turn,
        questionId: decision.questionId,
        answerId: rawAnswer,
        selectedDistrict: selectedDistrict?.oevk,
      });
      throw error;
    }

    return {
      newGameState,
      decision,
      rawAnswer,
    };
  };

  const commitTurn = ({
    newGameState,
    rawAnswer,
    decision,
  }: PendingTurn): CampaignState => {
    let persisted = true;
    const stopListening = container.resolve(StorageEngine).onWriteError(() => {
      persisted = false;
    });
    try {
      preserveState(rawAnswer, newGameState, decision);
    } finally {
      stopListening();
    }
    track("turn_committed", {
      ...runProperties,
      turn: newGameState.turn,
      persisted,
    });
    return newGameState;
  };

  const finishCampaign = () => {
    const finalResults = getFinalResults();
    trackOnce(sessionId, "campaign_finished", {
      ...runProperties,
      outcome: finalResults?.mayoralResult
        ? getMayoralCampaignOutcome(
            finalResults.mayoralResult.outcome,
            playerCandidateId,
          )
        : getCampaignOutcome(
            finalResults?.winnerParty?.party,
            Boolean(finalResults?.winnerParty?.hasMajority),
            playerSideId,
          ),
      majority_type: finalResults?.winnerParty?.majorityType ?? null,
      turns: gameState.turn,
    });
    goToFinalResults(campaignId, sessionId);
  };

  const getAnswer = (answers?: Answer[], answerId?: string) => {
    return answers?.find((a) => a.id === answerId);
  };

  const getFinalResults = () => {
    return campaignEngine.getFinalResults(
      gameState,
      getParliamentaryConfig(config.electionConfig)?.allSeats,
    );
  };

  const getListDataByPollProjection = (
    state: CampaignState,
    config: ElectionConfig,
    polls?: Record<string, number>,
    pollsterId?: string,
  ) => {
    const pollProjection = campaignEngine.getPollProjection(
      state,
      config,
      polls,
      pollsterId,
    );

    if (!pollProjection) {
      return;
    }

    setGameState((prev) => ({
      ...prev,
      pollingOpnions: { ...pollProjection, selectedPollsterId: pollsterId },
    }));

    saveSession("campaignState", {
      ...gameState,
      pollingOpnions: { ...pollProjection, selectedPollsterId: pollsterId },
    });

    return pollProjection;
  };

  const preserveState = (
    answer: string,
    newGameState: CampaignState,
    decision: Decision,
  ) => {
    const visitedDistrict = {
      oevk: decision.selectedDistrict?.oevk,
      megykod: decision.selectedDistrict?.megyekod,
    };
    const historyEntry = {
      questionId: gameState.currentQuestion?.id ?? "",
      answerId: answer,
      visitedDistrict,
      turn: newGameState.turn,
      results: newGameState.results,
    };
    saveSession("turnHistory", historyEntry);
    saveSession("campaignState", newGameState);
    setGameState(newGameState);
  };

  return {
    state: gameState,
    config,
    processAnswer,
    commitTurn,
    finishCampaign,
    getFinalResults,
    getMapDataByPolls: getListDataByPollProjection,
  };
}
