import { singleton } from "tsyringe";
import {
  CalculateResults,
  CampaignConfig,
  CampaignState,
  CandidateListData,
  Decision,
  RawEffect,
} from "@/shared/types";
import { createLogger } from "../../../shared/logger/logger";
import { Emitter } from "./Emitter";

export interface HistoryItem {
  questionId: string;
  answerId: string;
  visitedDistrict: Pick<CandidateListData, "oevk" | "megyekod">;
  turn: number;
  results: CalculateResults;
}

export interface AffectedQuestion {
  questionId: string;
  effect: RawEffect[];
}

export interface StateHandlerType {
  gameState: CampaignState;
  turnDecision?: Decision;
  currentConfig?: CampaignConfig;
  history?: HistoryItem[];
  affectedQuestions?: AffectedQuestion[];
}

const defaultState: StateHandlerType = {
  gameState: {
    activeCampaignId: "default-id",
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
