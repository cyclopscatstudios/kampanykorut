import { GameSettings } from "@/logic/application";
import {
  AdvisorFeedback,
  CalculateResults,
  CampaignState,
  CandidateListData,
  ConditionalAnswer,
  Decision,
  EffectType,
  ElectionConfig,
  FinalResults,
  PartyListData,
  PartyListVotes,
  RawAnsweEffectProps,
  RawEffect,
  RawParty,
  RawQuestion,
  Strategy,
  StrategyReward,
} from "@/shared/types";
import { createLogger } from "../logger/logger";
import type { EffectApplier } from "./EffectApplier";
import type { MandateCalculator } from "./MandateCalculator";
import { AGGREGATE_POLLSTER_ID, PollsterEngine } from "./PollsterEngine";
import type { ResultModifier } from "./ResultModifier";

const log = createLogger("CampaignEngine");

export class CampaignEngine {
  constructor(
    private readonly initialCandidateData: CandidateListData[],
    private readonly questions: RawQuestion[],
    private readonly answers: RawAnsweEffectProps[],
    private resultModifier: ResultModifier,
    private effectApplier: EffectApplier,
    private mandateCalculator: MandateCalculator,
    private pollsterEngine: PollsterEngine,
    private readonly initialPartyData?: PartyListData[],
    private readonly advisorFeedback?: AdvisorFeedback[],
  ) {
    log.debug("CampaignEngine initialized");
  }

  createInitialState(
    campaignId: string,
    savedState: CampaignState | null,
    electionConfig?: ElectionConfig,
  ): CampaignState {
    if (
      savedState &&
      savedState.candidateListData &&
      savedState.activeCampaignId === campaignId
    ) {
      log.info("initial state created from saved data");
      return savedState;
    }

    const { candidateListData: candidateData, partyListData: partyData } =
      this.mergeUnknownPartiesToOther(
        this.initialCandidateData,
        this.initialPartyData,
        electionConfig?.parties,
      );
    let candidateListData = candidateData;
    let partyListData = partyData;
    let partyListVotes = electionConfig?.partyListVotes;

    const baseResults = electionConfig?.baseResults;

    if (baseResults && !savedState?.isBaseResultsAlreadyApplied) {
      const baseApplied = this.applyBaseResults(
        campaignId,
        candidateListData,
        partyListData,
        baseResults,
        0,
        electionConfig.partyListVotes,
      );

      log.info("Create initial state with base result", baseApplied);

      candidateListData = baseApplied.candidateListData;
      partyListData = baseApplied.partyListData;
      partyListVotes = baseApplied.partyListVotes;
    }

    const initialState = {
      activeCampaignId: campaignId,
      turn: 0,
      currentQuestion: this.questions[0],
      answerEffects: this.getAnswerEffects(this.answers, this.questions[0]),
      candidateListData,
      partyListData,
      partyListVotes,
      playerSide: savedState?.playerSide,
      results: this.mandateCalculator.calculate(
        candidateListData,
        partyListData,
        electionConfig,
        partyListVotes,
      ),
      isEnded: false,
      isBaseResultsAlreadyApplied: true,
    };

    const polls = this.pollsterEngine.getPolls(initialState, electionConfig);

    return {
      ...initialState,
      pollingOpnions: this.getPollProjection(
        initialState,
        electionConfig,
        polls,
        AGGREGATE_POLLSTER_ID,
      ),
    };
  }

  processTurn(
    state: CampaignState,
    decision: Decision,
    history: Array<{ questionId: string; answerId: string }> = [],
    gameSettings: GameSettings,
    electionConfig: ElectionConfig,
    campaignStrategies?: Strategy[],
  ): CampaignState {
    if (state.turn >= this.questions.length) {
      log.info("Game has ended.");
      return state;
    }
    const appliedEffects = this.effectApplier.getAppliedEffects(
      decision.effects,
      state.candidateListData ?? [],
      state.turn,
      decision.conditionalEffects,
      decision.selectedDistrict,
    );
    const modified = this.resultModifier.apply(state, appliedEffects);

    const polls = this.pollsterEngine.getPolls(state, electionConfig);

    const nextTurn = state.turn + 1;
    let candidateListData = this.resultModifier.filterUnwantedValues(
      modified?.candidateListData,
    );

    let partyListVotes = modified?.partyListVotes;

    if (!this.questions[nextTurn] && campaignStrategies) {
      log.info("apply campaign strategy");
      const { candidateListData: listData, partyListVotes: listVotes } =
        this.applyStrategy(
          campaignStrategies,
          history,
          state,
          modified?.candidateListData ?? [],
          modified?.partyListData ?? [],
          modified?.partyListVotes,
        );
      candidateListData = listData;
      partyListVotes = listVotes;
    }

    const calculated = this.mandateCalculator.calculate(
      candidateListData,
      modified?.partyListData,
      electionConfig,
      partyListVotes,
    );

    const session = {
      ...state,
      turn: nextTurn,
      currentQuestion: this.questions[nextTurn],
      answerEffects: this.getAnswerEffects(
        this.answers,
        this.questions[nextTurn],
      ),
      candidateListData: candidateListData ?? state.candidateListData,
      partyListData: modified?.partyListData ?? state.partyListData,
      partyListVotes: partyListVotes ?? state.partyListVotes,
      advisorFeedback: this.getAdivsorFeedback(
        decision.answerId,
        state.currentQuestion,
        history,
        gameSettings,
      ),
      results: calculated,
      isEnded: nextTurn >= this.questions.length,
      pollingOpnions: this.getPollProjection(state, electionConfig, polls),
    };

    return session;
  }

  getPollProjection(
    state: CampaignState,
    electionConfig?: ElectionConfig,
    polls?: Record<string, number>,
    id?: string,
  ) {
    if (!polls || !state.candidateListData) {
      return undefined;
    }
    const effect: RawEffect = {
      type: EffectType.UniformSwing,
      params: polls,
    };
    const appliedEffects = this.effectApplier.getAppliedEffects(
      [effect],
      state.candidateListData,
      1,
    );

    const modified = this.resultModifier.apply(state, appliedEffects, true);
    if (!modified?.candidateListData || !modified?.partyListData) {
      log.warn("failed to apply poll effects for polling opinions", {
        state,
        polls,
      });
      return undefined;
    }

    const calculated = this.mandateCalculator.calculate(
      modified?.candidateListData,
      modified?.partyListData,
      electionConfig,
      modified.partyListVotes,
    );

    return {
      candidateListData: modified.candidateListData,
      partyListData: modified.partyListData,
      partyListVotes: modified.partyListVotes,
      percentages: calculated?.percentages,
      selectedPollsterId: id,
    };
  }

  applyStrategy(
    strategy: Strategy[],
    history: Array<{ questionId: string; answerId: string }> = [],
    state: CampaignState,
    data1: CandidateListData[],
    data2: PartyListData[],
    data3?: PartyListVotes,
  ) {
    let candidateListData = data1 ?? [];
    let partyListData = data2 ?? [];
    let partyListVotes = data3;

    for (const str of strategy) {
      const matchCount = str.conditions.filter((condition) =>
        history.some(
          (h) =>
            h.questionId === condition.questionId &&
            h.answerId === condition.answerId,
        ),
      ).length;

      const reward = str.rewards
        .filter((r) => matchCount >= r.minMatches)
        .reduce<
          StrategyReward | undefined
        >((best, current) => (!best || current.minMatches > best.minMatches ? current : best), undefined);

      log.debug(
        `campaign strategy for ${str.label} completed ${matchCount} matches${reward ? `, applying reward for ${reward.minMatches} matches` : ", no reward"}`,
      );

      if (!reward) {
        continue;
      }

      log.info(
        `campaign strategy fulfilled for ${str.label} (${reward.minMatches} matches)`,
      );

      const appliedEffects = this.effectApplier.getAppliedEffects(
        reward.effects,
        candidateListData,
        state.turn,
      );

      const modified = this.resultModifier.apply(state, appliedEffects);
      candidateListData = modified?.candidateListData ?? [];
      partyListData = modified?.partyListData ?? [];
      partyListVotes = modified?.partyListVotes;
    }

    return {
      candidateListData,
      partyListData,
      partyListVotes,
    };
  }

  getFinalResults(state: CampaignState): FinalResults | null {
    const winnerParty = state.results?.mandates.reduce((max, party) => {
      return party.totalSeats > max.totalSeats ? party : max;
    }, state.results.mandates[0]);
    const hasMajority = winnerParty ? winnerParty.totalSeats > 100 : false;
    const majorityType = this.getMajorityType(winnerParty);

    const results = this.assertFinalResults(state.results);

    if (!results) {
      log.error("final results not found");
      return null;
    }

    return {
      ...results,
      winnerParty: {
        ...winnerParty,
        hasMajority,
        majorityType,
      },
    };
  }

  private assertFinalResults(results?: CalculateResults) {
    if (
      !results?.compensation ||
      !results.percentages ||
      !results.constituencySeats ||
      !results.listSeats ||
      !results.mandates ||
      !results.totals
    ) {
      return null;
    }
    return results;
  }

  private mergeUnknownPartiesToOther(
    candidateListData: CandidateListData[],
    partyListData?: PartyListData[],
    parties?: RawParty[],
  ) {
    const validPartyIds = new Set(parties?.map((p) => p.id));

    const processPartok = (
      partok: Record<string, number | undefined>,
    ): Record<string, number | undefined> => {
      const result: Record<string, number | undefined> = {};
      let otherValue = partok._other ?? 0;

      for (const [partyId, value] of Object.entries(partok)) {
        if (partyId === "_other") {
          continue;
        }

        if (validPartyIds.has(partyId)) {
          result[partyId] = value;
        } else {
          otherValue += value ?? 0;
        }
      }

      result._other = otherValue;

      return result;
    };

    const filteredCandidateListData = candidateListData.map((row) => ({
      ...row,
      partok: processPartok(row.partok),
      jeloltek: row.jeloltek
        ? Object.fromEntries(
            Object.entries(row.jeloltek).filter(([partyId]) =>
              validPartyIds.has(partyId),
            ),
          )
        : undefined,
    }));

    const filteredPartyListData = partyListData?.map((row) => ({
      ...row,
      partok: processPartok(row.partok),
    }));

    log.debug("merging unknown parties to other");

    return {
      candidateListData: filteredCandidateListData as CandidateListData[],
      partyListData: filteredPartyListData as PartyListData[],
    };
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
    campaignId: string,
    candidateListData: CandidateListData[],
    partyListData: PartyListData[],
    baseResults: Record<string, number>,
    turn: number,
    partyListVotes: PartyListVotes,
  ) {
    const tempState: CampaignState = {
      activeCampaignId: campaignId,
      turn: 0,
      candidateListData,
      partyListData,
      isEnded: false,
      isBaseResultsAlreadyApplied: true,
      partyListVotes,
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
      partyListVotes: results?.partyListVotes ?? partyListVotes,
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
