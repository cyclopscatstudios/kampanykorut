import { container } from "tsyringe";
import {
  ConfigEngine,
  createCampaignEngine,
  loadCampaignConfig,
  StateEngine,
} from "@/logic/application";
import {
  CampaignState,
  Decision,
  GameSettings,
  HistoryItem,
  PlayerSide,
} from "@/shared/types";

/** questionId -> answerId. Questions not listed fall back to their first possible answer. */
export type AnswerPlan = Record<string, string>;

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
      const answerId = answerPlan[question.id] ?? question.possibleAnswers[0]?.id;
      if (!answerId) {
        throw new Error(`Question "${question.id}" has no possible answers`);
      }
      const answer = state.answerEffects?.find((a) => a.id === answerId);
      if (!answer) {
        throw new Error(
          `No answer effects found for question "${question.id}" answerId "${answerId}" - check answerPlan for typos`,
        );
      }

      const decision: Decision = {
        questionId: question.id,
        answerId,
        effects: answer.effects,
        conditionalEffects: answer.conditionalEffects,
        selectedDistrict: null,
      };

      state = campaignEngine.processTurn(
        state,
        decision,
        history,
        gameSettings,
        config.electionConfig,
        campaignStrategies,
        config.electionConfig.districtBoost,
        playerSide?.partyId,
      );

      history.push({
        questionId: question.id,
        answerId,
        visitedDistrict: {} as HistoryItem["visitedDistrict"],
        turn: state.turn,
        results: state.results!,
      });
    }

    this.stateEngine.updateCampaignState(state);
    history.forEach((item) => this.stateEngine.saveState("turnHistory", item));

    return {
      sessionId: this.stateEngine.getSessionId(),
      state: this.stateEngine.getCampaignState(),
    };
  }
}

declare global {
  interface Window {
    kampanykorut?: CampaignApi;
  }
}

export function initCampaignApi() {
  if (!import.meta.env.DEV || window.kampanykorut) {
    return;
  }

  window.kampanykorut = new CampaignApi(
    container.resolve(ConfigEngine),
    container.resolve(StateEngine),
  );
}
