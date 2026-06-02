import { useMemo, useState } from "react";
import { createCampaignEngine } from "../createCampaignEngine";
import { useStateEngine } from "./useStateEngine";
import { useSettings } from "./useSettings";
import { gameModeRegistry } from "../gameModeRegistery";
import { useNavigation } from "../../../hooks/navigationHook";
import {
  Answer,
  CampaignState,
  Decision,
  District,
  PendingTurn,
} from "@/shared/types";

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
    if (newGameState.isEnded) {
      goToFinalResults(campaignId, sessionId);
    }
    return newGameState;
  };

  const getAnswer = (answers?: Answer[], answerId?: string) => {
    return answers?.find((a) => a.id === answerId);
  };

  const getFinalResults = () => {
    return campaignEngine.getFinalResults(gameState);
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
    getFinalResults,
  };
}
