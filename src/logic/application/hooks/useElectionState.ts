import { useEffect, useMemo, useState } from "react";
import {
  Answer,
  CampaignState,
  Decision,
  District,
  ElectionConfig,
  PendingTurn,
} from "@/shared/types";
import { useNavigation } from "../../../hooks/navigationHook";
import { createCampaignEngine } from "../createCampaignEngine";
import { gameModeRegistry } from "../gameModeRegistery";
import { useSettings } from "./useSettings";
import { useStateEngine } from "./useStateEngine";

export function useElectionState(campaignId: string) {
  const config = gameModeRegistry[campaignId];
  const { campaignEngine } = useMemo(
    () => createCampaignEngine(config, campaignId),
    [config, campaignId],
  );
  const { saveSession, currentState, currentHistory, sessionId } =
    useStateEngine();
  const [gameState, setGameState] = useState<CampaignState>(() =>
    campaignEngine.createInitialState(
      campaignId,
      currentState,
      config.electionConfig,
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
      config.campaignStrategies,
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
