import type { Effect } from "../ElectionEffectApplier";
import type { ResultModifier } from "../ResultModifier";
import type {
  CandidateListData,
  PartyListData,
} from "../ResultTransformer/PipelineTransform";

export interface GameState {
  candidateListData: CandidateListData[];
  partyListData: PartyListData[];
}

export interface Decision {
  questionId: string;
  answerId: string;
  effect: Effect;
}

export class CampaignEngine {
  constructor(private resultModifier: ResultModifier) {}

  processTurn(state: GameState, decision: Decision) {
    const modified = this.resultModifier.apply(state, decision);
  }
}
