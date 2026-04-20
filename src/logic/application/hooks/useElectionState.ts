import { useEffect, useMemo, useState } from "react";
import type { Decision, GameState } from "../../domain/CampaignEngine";
import { createCampaignEngine } from "../createCampaignEngine";
import type { DistrictResult } from "../../../components/ui/map.utils";
import { gameModeRegistry } from "../gameModeRegistery";
import { useStateEngine } from "./useStateEngine";
import { useStateHandler } from "./useStateHandler";
import type { PendingTurn, Answer } from "../../types/campaignEngine.types";
import { container } from "tsyringe";
import { SettingsEngine } from "../SettingsEngine";

export function useElectionState(campaignId: string) {
  const config = gameModeRegistry[campaignId];
  const { campaignEngine } = useMemo(
    () => createCampaignEngine(config),
    [config],
  );
  const [gameState, setGameState] = useState<GameState>(() =>
    campaignEngine.createInitialState(config.electionConfig.baseResults),
  );
  const { loadSession, saveSession } = useStateEngine();
  const { getState, updateState } = useStateHandler();
  const settingsEngine = container.resolve(SettingsEngine);

  useEffect(() => {
    updateState("currentConfig", config);
  }, [config, updateState]);

  const loadSavedGame = () => {
    const session = loadSession("gameSession");
    setGameState(session);
  };

  const processAnswer = (
    rawAnswer?: string,
    selectedDistrict?: DistrictResult | null,
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
    const history = getState("history") ?? [];
    const gameSettings = settingsEngine.getGameSettings();
    const newGameState = campaignEngine.processTurn(
      gameState,
      decision,
      history,
      gameSettings,
    );

    return {
      newGameState,
      decision,
      rawAnswer,
    };
  };

  const commitTurn = ({
    newGameState,
    decision,
    rawAnswer,
  }: PendingTurn): GameState => {
    preserveState(rawAnswer, decision, newGameState);
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
    decision: Decision,
    newGameState: GameState,
  ) => {
    const historyEntry = {
      questionId: gameState.currentQuestion?.id ?? "",
      answerId: answer,
    };
    const historyItems = getState("history");
    if (historyItems) {
      const newHistoryItems = [...historyItems, historyEntry];
      updateState("history", newHistoryItems);
      saveSession(newHistoryItems, "questionHistory");
    }
    updateState("turnDecision", decision);
    saveSession(newGameState, "gameSession");
    updateState("gameState", newGameState);
    setGameState(newGameState);
  };

  return {
    state: gameState,
    config,
    processAnswer,
    commitTurn,
    loadSavedGame,
    getFinalResults,
  };
}
