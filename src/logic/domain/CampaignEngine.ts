import type { EffectApplier } from "./EffectApplier";
import type { ConditionalRawEffect, RawEffect } from "./EffectApplier.types";
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
import { createLogger } from "../logger";

export interface RawQuestion {
  id: string;
  title: string;
  question: string;
  possibleAnswers: {
    id: string;
    label: string;
  }[];
  affects?: { id: string }[];
  requires?: { questionId: string; answerId: string }[];
  blocks?: { questionId: string; answerId: string }[];
}

export interface GameState {
  turn: number;
  currentQuestion?: RawQuestion;
  answers?: Answer[];
  candidateListData: CandidateListData[];
  partyListData: PartyListData[];
  mandates?: CalculateResults;
  isEnded: boolean;
}

export interface Decision {
  questionId: string;
  answerId: string;
  effects: RawEffect[];
  conditionalEffects?: ConditionalRawEffect[];
}

export interface TurnResult {
  turn: number;
  candidateListData?: CandidateListData[];
  partyListData?: PartyListData[];
  mandates?: CalculateResults;
}

export interface FinalResults extends CalculateResults {
  winnerParty?: {
    party?: string;
    constituencySeats?: number;
    listSeats?: number;
    totalSeats?: number;
    hasMajority?: boolean;
    majorityType?: "simple" | "supermajority" | null;
  };
}

const log = createLogger("CampaignEngine");

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
      isEnded: false,
    };
  }

  processTurn(state: GameState, decision: Decision): GameState {
    if (state.turn > 3) {
      log.info("Game has ended. No more turns to process.");
      return state;
    }
    const appliedEffects = this.effectApplier.getAppliedEffects(
      decision.effects,
      state.candidateListData,
      decision.conditionalEffects,
    );
    console.log({ appliedEffects });
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
      isEnded: nextTurn > 3,
    };

    return session;
  }

  getFinalResults(state: GameState): FinalResults {
    const winnerParty = state.mandates?.mandates.reduce((max, party) => {
      return party.totalSeats > max.totalSeats ? party : max;
    }, state.mandates.mandates[0]);
    const hasMajority = winnerParty ? winnerParty.totalSeats > 100 : false;
    const majorityType = this.getMajorityType(winnerParty);
    return {
      ...state.mandates,
      winnerParty: {
        ...winnerParty,
        hasMajority,
        majorityType,
      },
    } as FinalResults;
  }

  private getMajorityType(winnderParty?: {
    party: string;
    constituencySeats: number;
    listSeats: number;
    totalSeats: number;
  }) {
    if (!winnderParty) {
      return null;
    }
    if (winnderParty.totalSeats >= 133) {
      return "supermajority";
    }
    if (winnderParty.totalSeats >= 100) {
      return "simple";
    }
    return null;
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
