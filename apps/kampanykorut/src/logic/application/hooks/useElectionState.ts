import { useEffect, useMemo, useState } from "react";
import { container } from "tsyringe";
import {
  Answer,
  CampaignState,
  Decision,
  District,
  ElectionConfig,
  PendingTurn,
} from "@/shared/types";
import { useNavigation } from "../../../hooks/navigationHook";
import { ConfigEngine } from "../ConfigEngine";
import { createCampaignEngine } from "../createCampaignEngine";
import { useSettings } from "./useSettings";
import { useStateEngine } from "./useStateEngine";

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
  const [gameState, setGameState] = useState<CampaignState>(() =>
    campaignEngine.createInitialState(
      campaignId,
      currentState,
      config.electionConfig,
      playerSideId,
    ),
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
    const newGameState = campaignEngine.processTurn(
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
      playerSideId,
    );

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
    preserveState(rawAnswer, newGameState, decision);
    return newGameState;
  };

  const finishCampaign = () => {
    goToFinalResults(campaignId, sessionId);
  };

  const getAnswer = (answers?: Answer[], answerId?: string) => {
    return answers?.find((a) => a.id === answerId);
  };

  const getFinalResults = () => {
    return campaignEngine.getFinalResults(gameState);
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
