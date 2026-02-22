import type { EffectApplier } from "./EffectApplier";
import type { RawEffect } from "./EffectApplier.types";
import type { MandateCalculator } from "./MandateCalculator";
import type { ResultModifier } from "./ResultModifier";
import type {
  CandidateListData,
  PartyListData,
} from "./ResultTransformer/VoteShareTransformer.types";
import type { CalculateResults } from "./MandateCalculator.types";
import type { Question } from "../../components/ui/gameplay/QuestionCard";
import type {
  AnsweEffectProps,
  Answer,
} from "../application/hooks/useElectionState";

export interface GameState {
  turn: number;
  currentQuestion?: Pick<
    Question,
    "id" | "title" | "question" | "possibleAnswers"
  >;
  answers?: Answer[];
  candidateListData: CandidateListData[];
  partyListData: PartyListData[];
  mandates?: CalculateResults;
}

export interface Decision {
  questionId: string;
  answerId: string;
  effects: RawEffect[];
}

export interface TurnResult {
  turn: number;
  candidateListData?: CandidateListData[];
  partyListData?: PartyListData[];
  mandates?: CalculateResults;
}

export class CampaignEngine {
  constructor(
    private readonly initialCandidateData: CandidateListData[],
    private readonly initialPartyData: PartyListData[],
    private readonly questions: Pick<
      Question,
      "id" | "title" | "question" | "possibleAnswers"
    >[],
    private readonly answers: AnsweEffectProps[],
    private resultModifier: ResultModifier,
    private effectApplier: EffectApplier,
    private mandateCalculator: MandateCalculator,
  ) {}

  createInitialState(): GameState {
    return {
      turn: 0,
      currentQuestion: this.questions[0],
      answers: this.getAnswers(this.answers, this.questions[0]),
      candidateListData: structuredClone(this.initialCandidateData),
      partyListData: structuredClone(this.initialPartyData),
      mandates: this.mandateCalculator.calculate(
        this.initialCandidateData,
        this.initialPartyData,
      ),
    };
  }

  processTurn(state: GameState, decision: Decision): GameState {
    const appliedEffects = this.effectApplier.getAppliedEffects(
      decision.effects,
      state.candidateListData,
    );
    const modified = this.resultModifier.apply(state, appliedEffects);
    const calculated = this.mandateCalculator.calculate(
      modified?.candidateListData,
      modified?.partyListData,
    );

    const nextTurn = state.turn + 1;

    const session = {
      ...state,
      turn: state.turn + 1,
      currentQuestion: this.questions[nextTurn],
      answers: this.getAnswers(this.answers, this.questions[nextTurn]),
      candidateListData: modified?.candidateListData ?? state.candidateListData,
      partyListData: modified?.partyListData ?? state.partyListData,
      mandates: calculated,
    };

    return session;
  }

  private getAnswers(
    answers: AnsweEffectProps[],
    currentQuestion: Pick<
      Question,
      "id" | "title" | "question" | "possibleAnswers"
    >,
  ) {
    return answers.find((e) => e.id === currentQuestion.id)?.answers;
  }
}
