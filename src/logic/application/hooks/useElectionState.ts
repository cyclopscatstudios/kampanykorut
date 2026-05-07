import { useMemo, useState } from "react";
import type { Decision, CampaignState } from "../../domain/CampaignEngine";
import { createCampaignEngine } from "../createCampaignEngine";
import type { DistrictResult } from "../../../components/ui/map.utils";
import { useStateEngine } from "./useStateEngine";
import type { PendingTurn, Answer } from "../../types/campaignEngine.types";
import { useSettings } from "./useSettings";
import { gameModeRegistry } from "../gameModeRegistery";

export function useElectionState(campaignId: string) {
  const config = gameModeRegistry[campaignId];
  const { campaignEngine } = useMemo(
    () => createCampaignEngine(config, campaignId),
    [config, campaignId],
  );
  const { saveSession, currentState, currentHistory } = useStateEngine();
  const [gameState, setGameState] = useState<CampaignState>(() =>
    campaignEngine.createInitialState(
      currentState,
      config.electionConfig.baseResults,
    ),
  );
  const { settings } = useSettings();

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
    const newGameState = campaignEngine.processTurn(
      gameState,
      decision,
      currentHistory ?? [],
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
    rawAnswer,
    decision,
  }: PendingTurn): CampaignState => {
    preserveState(rawAnswer, newGameState, decision);
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
    };
    saveSession("questionHistory", historyEntry);
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
