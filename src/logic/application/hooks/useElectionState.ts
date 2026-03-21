import { useEffect, useMemo, useState } from "react";
import type {
  CandidateListData,
  PartyListData,
} from "../../domain/ResultTransformer/VoteShareTransformer.types";
import type {
  Decision,
  GameState,
  RawQuestion,
} from "../../domain/CampaignEngine";
import type { ElectionConfig } from "../../domain/MandateCalculator.types";
import type { VoterEnvironmentConfig } from "../../VoterEnvironment";
import { createCampaignEngine } from "../createCampaignEngine";
import type {
  District,
  DistrictResult,
} from "../../../components/ui/map.utils";
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

export interface RawAnsweEffectProps {
  id: string;
  answers: Answer[];
}

export interface EndResultProps {
  playerSideDefeat: Asset;
  playerSideVictory: Asset;
}

export interface Asset {
  imageUri: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface AdvisorFeedback {
  questionId: string;
  answers: AnswerFeedback[];
  conditionalAnswers?: ConditionalAnswer[];
}

export interface ConditionalAnswer {
  if: {
    questionId: string;
    answerId: string;
  }[];
  answer: AnswerFeedback;
}

export interface AnswerFeedback {
  answerId: string;
  text: string;
}

export interface PendingTurn {
  newGameState: GameState;
  decision: Decision;
  rawAnswer: string;
}

export interface AdvisorFeedbackAssets {
  primaryAdvisorImageUri: string;
  secondaryAdvisorImageUri: string;
}

export interface GameModeConfig {
  electionConfig: ElectionConfig;
  voterEnvironmentConfig: VoterEnvironmentConfig;
  candidateListData: CandidateListData[];
  partyListData: PartyListData[];
  districts: District[];
  capitalCity: District[];
  questions: RawQuestion[];
  answerEffect: RawAnsweEffectProps[];
  endResults: EndResultProps;
  advisorFeedback: AdvisorFeedback[];
  advisorFeedbackAssets: AdvisorFeedbackAssets;
}

export function useElectionState(gameId: string) {
  const config = gameModeRegistry[gameId];
  const campaignEngine = useMemo(() => createCampaignEngine(config), [config]);
  const [gameState, setGameState] = useState<GameState>(() =>
    campaignEngine.createInitialState(),
  );
  const { loadSession, saveSession } = useStateEngine();
  const { getState, updateState } = useStateHandler();

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
    const answer = getAnswer(gameState?.answers, rawAnswer);
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
    const newGameState = campaignEngine.processTurn(gameState, decision);
    return { newGameState, decision, rawAnswer };
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
