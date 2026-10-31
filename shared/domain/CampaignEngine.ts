import { createLogger } from "../logger";
import {
  AdvisorFeedback,
  CalculateResults,
  CampaignEventEffect,
  CampaignState,
  CandidateListData,
  ConditionalAnswer,
  Decision,
  EffectType,
  ElectionConfig,
  FinalResults,
  GameSettings,
  HistoryItem,
  PartyListData,
  PartyListVotes,
  RawAnsweEffectProps,
  RawEffect,
  RawParty,
  RawQuestion,
  Strategy,
  StrategyReward,
} from "../types";
import { CampaignEventEngine } from "./CampaignEventEngine";
import { getInactiveCandidateIds } from "./CampaignStateAccess";
import type { EffectApplier } from "./EffectApplier";
import { getParliamentaryConfig, isMayoralElection } from "./ElectionType";
import { getMajorityType } from "./Majority";
import type { MandateCalculator } from "./MandateCalculator";
import { MayoralResultCalculator } from "./MayoralResultCalculator";
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
    private mayoralResultCalculator: MayoralResultCalculator,
    private readonly initialPartyData?: PartyListData[],
    private readonly advisorFeedback?: AdvisorFeedback[],
    private readonly eventEngine: CampaignEventEngine =
      new CampaignEventEngine(),
  ) {
    log.debug("CampaignEngine initialized");
  }

  createInitialState(
    campaignId: string,
    savedState: CampaignState | null,
    electionConfig?: ElectionConfig,
    palyerSideId?: string,
    campaignConfigVersion?: string,
  ): CampaignState {
    if (
      savedState &&
      savedState.candidateListData &&
      savedState.activeCampaignId === campaignId
    ) {
      log.info("initial state created from saved data");
      this.warnOnConfigVersionChange(savedState, campaignConfigVersion);
      return this.restorePollingOpinions(savedState, electionConfig);
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
    const id = palyerSideId ?? "";

    const baseResults = electionConfig?.baseResults?.[id];

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
      ...this.calculateResults(
        candidateListData,
        partyListData,
        electionConfig,
        partyListVotes,
      ),
      isEnded: false,
      isBaseResultsAlreadyApplied: true,
      ...(campaignConfigVersion && { campaignConfigVersion }),
    };

    const polls = this.pollsterEngine.getPolls(initialState);

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
    history: HistoryItem[],
    gameSettings: GameSettings,
    electionConfig: ElectionConfig,
    campaignStrategies?: Strategy[],
    districtBoost?: boolean,
    playerVoteKey?: string,
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
      districtBoost,
      playerVoteKey,
      history,
    );
    const modified = this.resultModifier.apply(state, appliedEffects);

    const nextTurn = state.turn + 1;
    let candidateListData = this.resultModifier.filterUnwantedValues(
      modified?.candidateListData,
    );

    let partyListData = modified?.partyListData;
    let partyListVotes = modified?.partyListVotes;

    if (!this.questions[nextTurn] && campaignStrategies) {
      log.info("apply campaign strategy");
      const strategyResult = this.applyStrategy(
        campaignStrategies,
        history,
        state,
        candidateListData ?? state.candidateListData ?? [],
        partyListData ?? state.partyListData ?? [],
        partyListVotes ?? state.partyListVotes,
      );
      candidateListData = strategyResult.candidateListData;
      partyListData = strategyResult.partyListData;
      partyListVotes = strategyResult.partyListVotes;
    }

    const calculated = this.calculateResults(
      candidateListData,
      partyListData,
      electionConfig,
      partyListVotes,
      getInactiveCandidateIds(state),
    );

    const answered = {
      ...state,
      turn: nextTurn,
      currentQuestion: this.questions[nextTurn],
      answerEffects: this.getAnswerEffects(
        this.answers,
        this.questions[nextTurn],
      ),
      candidateListData: candidateListData ?? state.candidateListData,
      partyListData: partyListData ?? state.partyListData,
      partyListVotes: partyListVotes ?? state.partyListVotes,
      advisorFeedback: this.getAdivsorFeedback(
        decision.answerId,
        state.currentQuestion,
        history,
        gameSettings,
      ),
      ...calculated,
      isEnded: nextTurn >= this.questions.length,
    };

    const session = this.eventEngine.run(
      answered,
      [
        ...history,
        { questionId: decision.questionId, answerId: decision.answerId },
      ],
      electionConfig,
      (current, effects) =>
        this.applyEventEffects(current, effects, electionConfig),
    );

    const { polls, pollsterId } = this.getPollsForPollster(
      session,
      electionConfig,
      state.pollingOpnions?.selectedPollsterId,
    );

    return {
      ...session,
      pollingOpnions: this.getPollProjection(
        session,
        electionConfig,
        polls,
        pollsterId,
      ),
    };
  }

  private getPollsForPollster(
    state: CampaignState,
    electionConfig?: ElectionConfig,
    pollsterId?: string,
  ) {
    if (pollsterId && pollsterId !== AGGREGATE_POLLSTER_ID && electionConfig) {
      const polls = this.pollsterEngine.getPollsByPollsterId(
        pollsterId,
        state,
      )?.differences;
      if (polls && Object.keys(polls).length > 0) {
        return { polls, pollsterId };
      }
    }
    return {
      polls: this.pollsterEngine.getPolls(state),
      pollsterId: pollsterId === undefined ? undefined : AGGREGATE_POLLSTER_ID,
    };
  }

  restorePollingOpinions(
    state: CampaignState,
    electionConfig?: ElectionConfig,
  ): CampaignState {
    const saved = state.pollingOpnions;
    if (saved?.candidateListData) {
      return state;
    }
    const { polls, pollsterId } = saved?.polls
      ? { polls: saved.polls, pollsterId: saved.selectedPollsterId }
      : this.getPollsForPollster(
          state,
          electionConfig,
          saved?.selectedPollsterId ?? AGGREGATE_POLLSTER_ID,
        );
    return {
      ...state,
      pollingOpnions: this.getPollProjection(
        state,
        electionConfig,
        polls,
        pollsterId ?? AGGREGATE_POLLSTER_ID,
      ),
    };
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

    const { results: calculated } = this.calculateResults(
      modified.candidateListData,
      modified.partyListData,
      electionConfig,
      modified.partyListVotes,
    );

    return {
      candidateListData: modified.candidateListData,
      partyListData: modified.partyListData,
      partyListVotes: modified.partyListVotes,
      percentages: calculated?.percentages,
      selectedPollsterId: id,
      polls,
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

      const modified = this.resultModifier.apply(
        { ...state, candidateListData, partyListData, partyListVotes },
        appliedEffects,
      );
      if (!modified) {
        continue;
      }
      candidateListData = modified.candidateListData ?? candidateListData;
      partyListData = modified.partyListData ?? partyListData;
      partyListVotes = modified.partyListVotes;
    }

    return {
      candidateListData,
      partyListData,
      partyListVotes,
    };
  }

  getFinalResults(
    state: CampaignState,
    allSeats?: number,
  ): FinalResults | null {
    if (state.mayoralResult) {
      const results = this.assertFinalResults(state.results);
      if (!results) {
        log.error("final results not found");
        return null;
      }
      return { ...results, mayoralResult: state.mayoralResult };
    }

    const winnerParty = state.results?.mandates.reduce((max, party) => {
      return party.totalSeats > max.totalSeats ? party : max;
    }, state.results.mandates[0]);
    const seatTotal =
      allSeats ??
      state.results?.mandates.reduce((sum, m) => sum + m.totalSeats, 0) ??
      0;
    const majorityType = winnerParty
      ? getMajorityType(winnerParty.totalSeats, seatTotal)
      : null;
    const hasMajority = majorityType !== null;

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

  private applyEventEffects(
    state: CampaignState,
    effects: CampaignEventEffect[],
    electionConfig: ElectionConfig,
  ): CampaignState {
    const appliedEffects = this.effectApplier.getAppliedEffects(
      effects,
      state.candidateListData ?? [],
      state.turn,
    );
    const modified = this.resultModifier.apply(state, appliedEffects);
    if (!modified) {
      return state;
    }
    const candidateListData =
      this.resultModifier.filterUnwantedValues(modified.candidateListData) ??
      state.candidateListData;
    const partyListData = modified.partyListData ?? state.partyListData;
    const partyListVotes = modified.partyListVotes ?? state.partyListVotes;

    return {
      ...state,
      candidateListData,
      partyListData,
      partyListVotes,
      ...this.calculateResults(
        candidateListData,
        partyListData,
        electionConfig,
        partyListVotes,
        getInactiveCandidateIds(state),
      ),
    };
  }

  private warnOnConfigVersionChange(
    savedState: CampaignState,
    currentVersion?: string,
  ) {
    const savedVersion = savedState.campaignConfigVersion;
    if (savedVersion && currentVersion && savedVersion !== currentVersion) {
      log.warn("Campaign config changed since this game was started", {
        campaignId: savedState.activeCampaignId,
        savedVersion,
        currentVersion,
      });
    }
  }

  private calculateResults(
    candidateListData: CandidateListData[] | undefined,
    partyListData: PartyListData[] | undefined,
    electionConfig: ElectionConfig | undefined,
    partyListVotes?: PartyListVotes,
    inactiveCandidateIds: string[] = [],
  ): Pick<CampaignState, "results" | "mayoralResult"> {
    if (!electionConfig || !isMayoralElection(electionConfig)) {
      return {
        results: this.mandateCalculator.calculate(
          candidateListData,
          partyListData,
          getParliamentaryConfig(electionConfig),
          partyListVotes,
        ),
      };
    }
    if (!candidateListData) {
      log.error("Missing candidate data for mayoral calculation");
      return {};
    }
    return {
      results: this.getVoteOnlyResults(candidateListData),
      mayoralResult: this.mayoralResultCalculator.calculate(candidateListData, {
        inactiveCandidateIds,
      }),
    };
  }

  private getVoteOnlyResults(
    candidateListData: CandidateListData[],
  ): CalculateResults {
    const totals = this.mandateCalculator.sumPartyTotals(candidateListData);
    return {
      totals: { candidateListResults: totals, partyListResults: {} },
      percentages: {
        candidateListResults:
          this.mandateCalculator.calculatePercentages(totals),
        partyListResults: {},
      },
      mandates: [],
      constituencySeats: {},
      listSeats: {},
      compensation: { losingVotes: {}, winnerCompensation: {}, total: {} },
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
      answerId,
      advisorFeedback?.conditionalAnswers,
      history,
    );

    if (conditionalFeedback) {
      return conditionalFeedback;
    }

    return advisorFeedback?.answers.find((a) => a.answerId === answerId);
  }

  private resolveConditionalFeedback(
    answerId: string,
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
      if (cond.answer.answerId !== answerId) {
        continue;
      }

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
    partyListVotes?: PartyListVotes,
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
