import { injectable } from "tsyringe";
import type { EffectApplier } from "./EffectApplier";
import type { RawEffect } from "./EffectApplier.types";
import type { MandateCalculator } from "./MandateCalculator";
import type { ResultModifier } from "./ResultModifier";
import type {
  CandidateListData,
  PartyListData,
} from "./ResultTransformer/PipelineTransform.types";

export interface GameState {
  candidateListData: CandidateListData[];
  partyListData: PartyListData[];
}

export interface Decision {
  questionId: string;
  answerId: string;
  effect: RawEffect;
}

@injectable()
export class CampaignEngine {
  constructor(
    private resultModifier: ResultModifier,
    private effectApplier: EffectApplier,
    private mandateCalculator: MandateCalculator,
  ) {}

  processTurn(state: GameState, decision: Decision) {
    const appliedEffects = this.effectApplier.getAppliedEffect(
      decision.effect,
      state.candidateListData,
    );
    const modified = this.resultModifier.apply(state, appliedEffects);
    const calculated = this.mandateCalculator.calculate(
      modified?.candidateListData,
      modified?.partyListData,
    );

    return { modified, calculated };
  }
}
