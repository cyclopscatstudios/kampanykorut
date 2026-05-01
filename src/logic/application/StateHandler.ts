import { singleton } from "tsyringe";
import type { Decision, GameState } from "../domain/CampaignEngine";
import { Emitter } from "./Emitter";
import { createLogger } from "../logger";
import type { RawEffect, CampaignConfig } from "../types/campaignEngine.types";

export interface HistoryItem {
  questionId: string;
  answerId: string;
}

export interface AffectedQuestion {
  questionId: string;
  effect: RawEffect[];
}

export interface StateHandlerType {
  gameState: GameState;
  turnDecision?: Decision;
  currentConfig?: CampaignConfig;
  history?: HistoryItem[];
  affectedQuestions?: AffectedQuestion[];
}

const defaultState: StateHandlerType = {
  gameState: {
    candidateListData: [],
    partyListData: [],
    turn: 0,
    isEnded: false,
  },
  currentConfig: undefined,
  history: [],
};

const log = createLogger("StateHandler");

@singleton()
export class StateHandler extends Emitter<StateHandlerType> {
  private state: StateHandlerType;

  constructor() {
    super();
    this.state = structuredClone(defaultState);
  }

  getState(): StateHandlerType {
    return this.state;
  }

  get<K extends keyof StateHandlerType>(key: K): StateHandlerType[K] {
    return this.state[key];
  }

  set<K extends keyof StateHandlerType>(key: K, value: StateHandlerType[K]) {
    this.state[key] = value;
    this.notify(this.state);
    log.debug("State updated", { key, value });
  }
}
