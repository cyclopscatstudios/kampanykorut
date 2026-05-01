import { useEffect, useMemo, useState } from "react";
import type { Decision, CampaignState } from "../../domain/CampaignEngine";
import { createCampaignEngine } from "../createCampaignEngine";
import type { DistrictResult } from "../../../components/ui/map.utils";
import { gameModeRegistry } from "../gameModeRegistery";
import { useStateEngine } from "./useStateEngine";
import { useStateHandler } from "./useStateHandler";
import type { PendingTurn, Answer } from "../../types/campaignEngine.types";
import { useSettings } from "./useSettings";
import { useCampaignStateEngine } from "./useCampaignStateEngine";

export function useElectionState(campaignId: string) {
  const config = gameModeRegistry[campaignId];
  const { campaignEngine } = useMemo(
    () => createCampaignEngine(config),
    [config],
  );
  const [gameState, setGameState] = useState<CampaignState>(() =>
    campaignEngine.createInitialState(config.electionConfig.baseResults),
  );
  const { saveSession } = useStateEngine();
  const { updateCampaignState } = useCampaignStateEngine();
  const { getState, updateState } = useStateHandler();
  const { settings } = useSettings();

  useEffect(() => {
    updateState("currentConfig", config);
  }, [config, updateState]);

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
    const newGameState = campaignEngine.processTurn(
      gameState,
      decision,
      history,
      settings,
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
  }: PendingTurn): CampaignState => {
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
    newGameState: CampaignState,
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
    updateCampaignState(newGameState);
    updateState("gameState", newGameState);
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
