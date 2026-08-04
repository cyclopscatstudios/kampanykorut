import { singleton } from "tsyringe";
import { createLogger } from "@/shared/logger/logger";
import {
  CampaignConfig,
  CampaignState,
  Decision,
  HistoryItem,
  RawEffect,
} from "@/shared/types";
import { Emitter } from "./Emitter";

export interface AffectedQuestion {
  questionId: string;
  effect: RawEffect[];
}

export interface StateHandlerType {
  campaignState: CampaignState | null;
  sessionId?: string;
  turnDecision?: Decision | null;
  campaignConfig: CampaignConfig | null;
  history?: HistoryItem[];
  affectedQuestions?: AffectedQuestion[];
}

export const DEFAULT_CAMPAIGN_ID = "default-id";

const defaultState: StateHandlerType = {
  campaignState: {
    activeCampaignId: DEFAULT_CAMPAIGN_ID,
    turn: 0,
    isEnded: false,
    isBaseResultsAlreadyApplied: false,
  },
  campaignConfig: null,
  turnDecision: null,
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
