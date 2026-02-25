import { useEffect, useMemo, useState } from "react";
import type {
  CandidateListData,
  PartyListData,
} from "../../domain/ResultTransformer/VoteShareTransformer.types";
import type { Decision, GameState } from "../../domain/CampaignEngine";
import type { ElectionConfig } from "../../domain/MandateCalculator.types";
import type { VoterEnvironmentConfig } from "../../VoterEnvironment";
import { createCampaignEngine } from "../createCampaignEngine";
import type { District } from "../../../components/ui/map.utils";
import type { Question } from "../../../components/ui/gameplay/QuestionCard";
import type {
  ConditionalRawEffect,
  RawEffect,
} from "../../domain/EffectApplier.types";
import { gameModeRegistry } from "../gameModeRegistery";
import { useStateEngine } from "./useStateEngine";
import { useStateHandler } from "./useStateHandler";

export type Answer = {
  id: string;
  effects: RawEffect[];
  conditionalEffects?: ConditionalRawEffect[];
};

export interface AnsweEffectProps {
  id: string;
  answers: Answer[];
}

export interface FinalResultAssets {
  playerSideDefeat: string;
  playerSideVictory: string;
}

export interface GameModeConfig {
  electionConfig: ElectionConfig;
  voterEnvironmentConfig: VoterEnvironmentConfig;
  candidateListData: CandidateListData[];
  partyListData: PartyListData[];
  districts: District[];
  capitalCity: District[];
  questions: Pick<Question, "id" | "title" | "question" | "possibleAnswers">[];
  answerEffect: AnsweEffectProps[];
  finalResultAssets: FinalResultAssets;
}

export function useElectionState(gameId: string) {
  const config = gameModeRegistry[gameId];
  const campaignEngine = useMemo(() => createCampaignEngine(config), [config]);
  const [gameState, setGameState] = useState<GameState>(() =>
    campaignEngine.createInitialState(),
  );
  const { loadSession, saveSession } = useStateEngine();
  const { updateState } = useStateHandler();

  useEffect(() => {
    updateState("currentConfig", config);
  }, [config]);

  const loadSavedGame = () => {
    const session = loadSession("gameSession");
    setGameState(session);
  };

  const handleAnwerQuestion = (answer?: string) => {
    const answerEffect = getAnswerEffects(gameState?.answers, answer);
    const conditionalEffects = getConditionalEffects(
      gameState?.answers,
      answer,
    );
    if (!answer || !gameState.currentQuestion || !answerEffect) {
      return;
    }
    const decision: Decision = {
      answerId: answer,
      questionId: gameState.currentQuestion?.id,
      effects: answerEffect,
      conditionalEffects: conditionalEffects,
    };
    const newGameState = campaignEngine.processTurn(gameState, decision);
    saveSession(newGameState, "gameSession");
    updateState("gameState", newGameState);
    updateState("turnDecision", decision);
    updateState("history", {
      questionId: gameState.currentQuestion?.id,
      answerId: answer,
    });
    setGameState(newGameState);
  };

  const getAnswerEffects = (answers?: Answer[], answerId?: string) => {
    return answers?.find((a) => a.id === answerId)?.effects;
  };

  const getConditionalEffects = (answers?: Answer[], answerId?: string) => {
    return answers?.find((a) => a.id === answerId)?.conditionalEffects;
  };

  const getFinalResults = () => {
    return campaignEngine.getFinalResults(gameState);
  };

  return {
    state: gameState,
    config,
    handleAnwerQuestion,
    loadSavedGame,
    getFinalResults,
  };
}
