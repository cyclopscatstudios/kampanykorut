import {
  ConfigEngine,
  createCampaignEngine,
  loadCampaignConfig,
  StateEngine,
} from "@logic/application";
import { getPlayerVoteKey } from "@shared/domain";
import {
  CampaignState,
  GameSettings,
  HistoryItem,
  PlayerSide,
} from "@shared/types";
import { container } from "tsyringe";

/** questionId -> answerId. Questions not listed fall back to their first possible answer. */
export type AnswerPlan = Record<string, string>;

export type SimulationMode = "first" | "last" | "random";

export interface SimulationOptions {
  runs?: number;
  seed?: number;
  mode?: SimulationMode;
  answerPlan?: AnswerPlan;
}

export interface CampaignSimulationSummary {
  campaignId: string;
  runs: number;
  seed: number;
  mode: SimulationMode;
  parties: Record<
    string,
    {
      averageTotalSeats: number;
      minTotalSeats: number;
      maxTotalSeats: number;
      averagePartyListVoteShare: number;
      winShare: number;
    }
  >;
}

export class CampaignApi {
  constructor(
    private configEngine: ConfigEngine,
    private stateEngine: StateEngine,
  ) {}

  async seedCampaign(campaignId: string, playerSide?: PlayerSide) {
    const config = await loadCampaignConfig(campaignId);
    this.configEngine.configure(config, campaignId, true);
    this.stateEngine.updateCampaignState({
      activeCampaignId: campaignId,
      playerSide,
    });
    return {
      sessionId: this.stateEngine.getSessionId(),
      state: this.stateEngine.getCampaignState(),
    };
  }

  getCampaignState() {
    return this.stateEngine.getCampaignState();
  }

  updateCampaignState(patch: Partial<CampaignState>) {
    this.stateEngine.updateCampaignState(patch);
    return this.stateEngine.getCampaignState();
  }

  /**
   * Plays a full campaign headlessly through the real CampaignEngine (same domain
   * logic/effects/mandate calculation as a UI playthrough), driven by `answerPlan`
   * instead of clicks. No district is ever visited (selectedDistrict stays null),
   * so district-boost effects never trigger - equivalent to a playthrough that
   * never opens the map between questions.
   */
  async playCampaign(
    campaignId: string,
    playerSide?: PlayerSide,
    answerPlan: AnswerPlan = {},
  ) {
    const config = await loadCampaignConfig(campaignId);
    this.configEngine.configure(config, campaignId, true);
    const { state, history } = runCampaign(
      config,
      campaignId,
      playerSide,
      (question) => answerPlan[question.id] ?? question.possibleAnswers[0]?.id,
    );

    this.stateEngine.updateCampaignState(state);
    history.forEach((item) => this.stateEngine.saveState("turnHistory", item));

    return {
      sessionId: this.stateEngine.getSessionId(),
      state: this.stateEngine.getCampaignState(),
    };
  }

  /**
   * Replays the real campaign engine many times without changing the active
   * game session or writing turn history to localStorage.
   */
  async simulateCampaign(
    campaignId: string,
    playerSide?: PlayerSide,
    options: SimulationOptions = {},
  ): Promise<CampaignSimulationSummary> {
    const requestedRuns = options.runs ?? 100;
    const runs = Number.isFinite(requestedRuns)
      ? Math.min(5000, Math.max(1, Math.floor(requestedRuns)))
      : 100;
    const requestedSeed = options.seed ?? 1;
    const seed = Number.isFinite(requestedSeed) ? requestedSeed >>> 0 : 1;
    const mode = options.mode ?? "random";
    const random = createSeededRandom(seed);
    const config = await loadCampaignConfig(campaignId);
    const previousState = this.stateEngine.getCampaignState();
    const previousConfig = previousState?.activeCampaignId
      ? this.configEngine.getCampaignConfig(previousState.activeCampaignId)
      : undefined;
    this.configEngine.configure(config, campaignId, true);

    const totals: Record<
      string,
      {
        seats: number[];
        partyListVoteShare: number[];
        wins: number;
      }
    > = {};

    const originalRandom = Math.random;
    Math.random = random;
    try {
      for (let run = 0; run < runs; run += 1) {
        const { state } = runCampaign(
          config,
          campaignId,
          playerSide,
          (question) => {
            const plannedAnswer = options.answerPlan?.[question.id];
            if (plannedAnswer) return plannedAnswer;

            const answers = question.possibleAnswers;
            if (mode === "last") return answers.at(-1)?.id;
            if (mode === "random") {
              return answers[Math.floor(random() * answers.length)]?.id;
            }
            return answers[0]?.id;
          },
        );

        const mandates = state.results?.mandates ?? [];
        const topSeats = Math.max(
          0,
          ...mandates.map((mandate) => mandate.totalSeats),
        );
        const winners = mandates.filter(
          (mandate) => mandate.totalSeats === topSeats,
        );

        for (const mandate of mandates) {
          const party = (totals[mandate.party] ??= {
            seats: [],
            partyListVoteShare: [],
            wins: 0,
          });
          party.seats.push(mandate.totalSeats);
          party.partyListVoteShare.push(
            state.results?.percentages.partyListResults[mandate.party] ?? 0,
          );
          if (winners.includes(mandate)) party.wins += 1 / winners.length;
        }
      }
    } finally {
      Math.random = originalRandom;
      if (previousConfig) {
        const previousCampaignId = previousState?.activeCampaignId ?? campaignId;
        this.configEngine.configure(previousConfig, previousCampaignId, true);
        createCampaignEngine(
          previousConfig,
          previousCampaignId,
          previousState?.playerSide?.partyId,
          previousState?.playerSide?.candidateId,
        );
      }
    }

    return {
      campaignId,
      runs,
      seed,
      mode,
      parties: Object.fromEntries(
        Object.entries(totals).map(([partyId, result]) => [
          partyId,
          {
            averageTotalSeats:
              result.seats.reduce((sum, seats) => sum + seats, 0) /
              result.seats.length,
            minTotalSeats: Math.min(...result.seats),
            maxTotalSeats: Math.max(...result.seats),
            averagePartyListVoteShare:
              result.partyListVoteShare.reduce((sum, share) => sum + share, 0) /
              result.partyListVoteShare.length,
            winShare: result.wins / runs,
          },
        ]),
      ),
    };
  }
}

function runCampaign(
  config: Awaited<ReturnType<typeof loadCampaignConfig>>,
  campaignId: string,
  playerSide: PlayerSide | undefined,
  selectAnswer: (question: NonNullable<CampaignState["currentQuestion"]>) =>
    | string
    | undefined,
) {
  const { campaignEngine } = createCampaignEngine(
    config,
    campaignId,
    playerSide?.partyId,
    playerSide?.candidateId,
  );

  let state: CampaignState = {
    ...campaignEngine.createInitialState(
      campaignId,
      null,
      config.electionConfig,
      playerSide?.partyId,
    ),
    playerSide,
  };
  const gameSettings: GameSettings = {
    showAdvisorFeedback: false,
    language: "hu",
  };
  const campaignStrategies =
    playerSide?.partyId && playerSide?.candidateId
      ? config.playableSides?.[playerSide.partyId]?.[playerSide.candidateId]
          ?.campaignStrategies
      : undefined;
  const history: HistoryItem[] = [];

  while (!state.isEnded && state.currentQuestion) {
    const question = state.currentQuestion;
    const answerId = selectAnswer(question);
    if (!answerId) {
      throw new Error(`Question "${question.id}" has no selected answer`);
    }
    const answer = state.answerEffects?.find((item) => item.id === answerId);
    if (!answer) {
      throw new Error(
        `No answer effects found for question "${question.id}" answerId "${answerId}" - check the answer plan`,
      );
    }

    state = campaignEngine.processTurn(
      state,
      {
        questionId: question.id,
        answerId,
        effects: answer.effects,
        conditionalEffects: answer.conditionalEffects,
        selectedDistrict: null,
      },
      history,
      gameSettings,
      config.electionConfig,
      campaignStrategies,
      config.electionConfig.districtBoost,
      getPlayerVoteKey(config.electionConfig, playerSide),
    );

    history.push({
      questionId: question.id,
      answerId,
      visitedDistrict: {} as HistoryItem["visitedDistrict"],
      turn: state.turn,
      results: state.results!,
    });
  }

  return { state, history };
}

function createSeededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

declare global {
  interface Window {
    kampanykorut?: CampaignApi;
  }
}

export function initCampaignApi() {
  if (!import.meta.env.DEV && import.meta.env.PLAYWRIGHT !== "true") {
    return;
  }

  // Replace the instance after Vite hot reloads this module so newly added
  // development API methods are available without preserving a stale object.
  window.kampanykorut = new CampaignApi(
    container.resolve(ConfigEngine),
    container.resolve(StateEngine),
  );
}
