import type { EffectApplier } from "./EffectApplier";
import type { MandateCalculator } from "./MandateCalculator";
import type { ResultModifier } from "./ResultModifier";
import type {
  CandidateListData,
  PartyListData,
} from "./ResultTransformer/VoteShareTransformer.types";
import type { CalculateResults } from "./MandateCalculator.types";
import { createLogger } from "../logger";
import type { DistrictResult } from "../../components/ui/map.utils";
import {
  type Answer,
  type AnswerFeedback,
  type RawAnsweEffectProps,
  type AdvisorFeedback,
  type ConditionalAnswer,
  EffectType,
  type ConditionalRawEffect,
  type RawEffect,
} from "../types/campaignEngine.types";

export interface GameSettings {
  showAdvisorFeedback: boolean;
}

export interface RawQuestion {
  id: string;
  title?: string;
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
  answerEffects?: Answer[];
  candidateListData: CandidateListData[];
  partyListData: PartyListData[];
  results?: CalculateResults;
  isEnded: boolean;
  advisorFeedback?: AnswerFeedback;
}

export interface Decision {
  questionId: string;
  answerId: string;
  effects: RawEffect[];
  conditionalEffects?: ConditionalRawEffect[];
  selectedDistrict?: DistrictResult | null;
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
    private readonly questions: RawQuestion[],
    private readonly answers: RawAnsweEffectProps[],
    private resultModifier: ResultModifier,
    private effectApplier: EffectApplier,
    private mandateCalculator: MandateCalculator,
    private readonly advisorFeedback?: AdvisorFeedback[],
  ) {}

  createInitialState(baseResults?: Record<string, number>): GameState {
    let candidateListData = this.initialCandidateData;
    let partyListData = this.initialPartyData;

    if (baseResults) {
      const baseApplied = this.applyBaseResults(
        candidateListData,
        partyListData,
        baseResults,
        0,
      );

      candidateListData = baseApplied.candidateListData;
      partyListData = baseApplied.partyListData;
    }

    return {
      turn: 0,
      currentQuestion: this.questions[0],
      answerEffects: this.getAnswerEffects(this.answers, this.questions[0]),
      candidateListData,
      partyListData,
      results: this.mandateCalculator.calculate(
        candidateListData,
        partyListData,
      ),
      isEnded: false,
    };
  }

  processTurn(
    state: GameState,
    decision: Decision,
    history: Array<{ questionId: string; answerId: string }> = [],
    gameSettings: GameSettings,
  ): GameState {
    if (state.turn >= this.questions.length) {
      log.info("Game has ended.");
      return state;
    }
    const appliedEffects = this.effectApplier.getAppliedEffects(
      decision.effects,
      state.candidateListData,
      state.turn,
      decision.conditionalEffects,
      decision.selectedDistrict,
    );
    const modified = this.resultModifier.apply(state, appliedEffects);
    const calculated = this.mandateCalculator.calculate(
      modified?.candidateListData,
      modified?.partyListData,
    );

    const nextTurn = state.turn + 1;

    const session = {
      ...state,
      turn: nextTurn,
      currentQuestion: this.questions[nextTurn],
      answerEffects: this.getAnswerEffects(
        this.answers,
        this.questions[nextTurn],
      ),
      candidateListData: modified?.candidateListData ?? state.candidateListData,
      partyListData: modified?.partyListData ?? state.partyListData,
      advisorFeedback: this.getAdivsorFeedback(
        decision.answerId,
        state.currentQuestion,
        history,
        gameSettings,
      ),
      results: calculated,
      isEnded: nextTurn >= this.questions.length,
    };

    return session;
  }

  getFinalResults(state: GameState): FinalResults {
    const winnerParty = state.results?.mandates.reduce((max, party) => {
      return party.totalSeats > max.totalSeats ? party : max;
    }, state.results.mandates[0]);
    const hasMajority = winnerParty ? winnerParty.totalSeats > 100 : false;
    const majorityType = this.getMajorityType(winnerParty);
    const mandates = { ...state.results };
    // TODO fix this assertation
    return {
      mandates,
      winnerParty: {
        ...winnerParty,
        hasMajority,
        majorityType,
      },
    } as FinalResults;
  }

  private getAdivsorFeedback(
    answerId: string,
    question?: RawQuestion,
    history: Array<{ questionId: string; answerId: string }> = [],
    gameSettings?: GameSettings,
  ) {
    const shouldShowAdvisorFeedback =
      gameSettings?.showAdvisorFeedback ?? false;
    if (!shouldShowAdvisorFeedback) {
      return undefined;
    }
    const advisorFeedback = this.advisorFeedback?.find(
      (f) => f.questionId === question?.id,
    );

    const conditionalFeedback = this.resolveConditionalFeedback(
      advisorFeedback?.conditionalAnswers,
      history,
    );

    if (conditionalFeedback) {
      return conditionalFeedback;
    }

    return advisorFeedback?.answers.find((a) => a.answerId === answerId);
  }

  private resolveConditionalFeedback(
    conditionalAnswers?: ConditionalAnswer[],
    history: Array<{ questionId: string; answerId: string }> = [],
  ) {
    if (!conditionalAnswers) {
      return;
    }

    if (!history?.length) {
      log.error("history is empty, but conditional feedback are present");
    }

    for (const cond of conditionalAnswers) {
      const matches = cond.if.every((condition) => {
        const h = history?.find((q) => q.questionId === condition.questionId);
        return h?.answerId === condition.answerId;
      });

      if (!matches) {
        log.info(`Condition not met for feedback: ${JSON.stringify(cond)}`);
        continue;
      }

      return {
        answerId: cond.answer.answerId,
        text: cond.answer.text,
      };
    }
  }

  private applyBaseResults(
    candidateListData: CandidateListData[],
    partyListData: PartyListData[],
    baseResults: Record<string, number>,
    turn: number,
  ) {
    const tempState: GameState = {
      turn: 0,
      candidateListData,
      partyListData,
      isEnded: false,
    };

    log.info("Applying base results to initial state", { baseResults });

    const appliedEffects = this.effectApplier.getAppliedEffects(
      [{ type: EffectType.UniformSwing, params: { ...baseResults } }],
      candidateListData,
      turn,
    );

    const results = this.resultModifier.apply(tempState, appliedEffects);

    return {
      candidateListData: results?.candidateListData ?? candidateListData,
      partyListData: results?.partyListData ?? partyListData,
    };
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

  private getAnswerEffects(
    answers: RawAnsweEffectProps[],
    currentQuestion?: RawQuestion,
  ) {
    if (!currentQuestion) {
      log.info("no currentQuestion was found, game ends in next turn");
      return;
    }
    return answers.find((e) => e.id === currentQuestion?.id)?.answers;
  }
}
