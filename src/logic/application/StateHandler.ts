import { singleton } from "tsyringe";
import type { Decision, GameState } from "../domain/CampaignEngine";
import { Emitter } from "./Emitter";
import type { GameModeConfig } from "./hooks/useElectionState";

interface StateHandlerType {
  gameState: GameState;
  turnDecision?: Decision;
  currentConfig?: GameModeConfig;
}

const defaultState: StateHandlerType = {
  gameState: {
    candidateListData: [],
    partyListData: [],
    turn: 0,
    isEnded: false,
  },
  currentConfig: undefined,
};

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
  }
}
