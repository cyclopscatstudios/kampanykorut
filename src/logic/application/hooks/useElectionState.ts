import { useMemo, useState } from "react";
import type {
  CandidateListData,
  PartyListData,
} from "../../domain/ResultTransformer/PipelineTransform.types";
import type { GameState } from "../../domain/CampaignEngine";
import type { ElectionConfig } from "../../domain/MandateCalculator.types";
import type { VoterEnvironmentConfig } from "../../VoterEnvironment";
import { createCampaignEngine } from "../createCampaignEngine";
import type { District } from "../../../components/ui/map.utils";
import type { Question } from "../../../components/ui/gameplay/QuestionCard";
import type { RawEffect } from "../../domain/EffectApplier.types";
import { gameModeRegistry } from "../gameModeRegistery";
import { useStateEngine } from "./useStateEngine";

export type Answer = {
  id: string;
  effects: RawEffect[];
};

export interface AnsweEffectProps {
  id: string;
  answers: Answer[];
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
}

export function useElectionState(gameId: string) {
  const config = gameModeRegistry[gameId];
  const campaignEngine = useMemo(() => createCampaignEngine(config), [config]);
  const [gameState, setGameState] = useState<GameState>(() =>
    campaignEngine.createInitialState(),
  );
  const { loadSession } = useStateEngine();

  const loadSavedGame = () => {
    const session = loadSession("gameSession");
    setGameState(session);
  };

  const handleAnwerQuestion = (answer?: string) => {
    const answerEffect = getAnswerEffects(gameState?.answers, answer);
    if (!answer || !gameState.currentQuestion || !answerEffect) {
      return;
    }
    const newGameState = campaignEngine.processTurn(
      {
        turn: gameState.turn,
        candidateListData: config.candidateListData,
        partyListData: config.partyListData,
      },
      {
        answerId: answer,
        questionId: gameState.currentQuestion?.id,
        effects: answerEffect,
      },
    );
    setGameState(newGameState);
  };

  const getAnswerEffects = (answers?: Answer[], answerId?: string) => {
    return answers?.find((a) => a.id === answerId)?.effects;
  };

  return {
    state: gameState,
    config,
    handleAnwerQuestion,
    loadSavedGame,
  };
}
