import { singleton } from "tsyringe";
import type { Decision, GameState } from "../domain/CampaignEngine";
import { Emitter } from "./Emitter";
import type { GameModeConfig } from "./hooks/useElectionState";
import { createLogger } from "../logger";

interface HistoryItem {
  questionId: string;
  answerId: string;
}

export interface StateHandlerType {
  gameState: GameState;
  turnDecision?: Decision;
  currentConfig?: GameModeConfig;
  history?: HistoryItem[];
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

  get<K extends keyof StateHandlerType>(key: K): Readonly<StateHandlerType[K]> {
    return this.state[key];
  }

  set<K extends keyof StateHandlerType>(key: K, value: StateHandlerType[K]) {
    this.state[key] = value;
    this.notify(this.state);
    log.info('State updated', { key, value });
  }
}
