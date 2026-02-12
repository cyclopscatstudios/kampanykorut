import type { GameState } from "./CampaignEngine";
import { type AppliedEffect, EffectType } from "./EffectApplier.types";
import { createLogger } from "../logger";
import { DistrictTargetTransform } from "./ResultTransformer/DistrictTargetTransform";
import { NationalSwingTransform } from "./ResultTransformer/NationalSwingTransform";
import { PipelineTransform } from "./ResultTransformer/PipelineTransform";
import type { CandidateListData } from "./ResultTransformer/PipelineTransform.types";

const log = createLogger("ResultModifier");

export class ResultModifier {
  constructor(
    private nationalSwingTransform: NationalSwingTransform,
    private pipelineTransform: PipelineTransform,
    private districtTargetTransform: DistrictTargetTransform,
  ) {}

  apply(
    state: GameState,
    appliedEffects?: AppliedEffect[],
  ): Pick<GameState, "candidateListData" | "partyListData"> | null {
    if (!appliedEffects?.length) {
      log.error("No applied effects provided to ResultModifier");
      return null;
    }

    let currentState = state;

    for (const effect of appliedEffects) {
      const partial = this.applySingleEffect(currentState, effect);

      if (!partial) continue;

      currentState = {
        ...currentState,
        ...partial,
      };
    }

    return {
      candidateListData: currentState.candidateListData,
      partyListData: currentState.partyListData,
    };
  }

  private applySingleEffect(
    state: GameState,
    effect: AppliedEffect,
  ): Pick<GameState, "candidateListData" | "partyListData"> | null {
    switch (effect.type) {
      case EffectType.PartySwing:
        return this.applyPartySwing(state, effect);

      case EffectType.PartyShare:
        return this.applyShares(state, effect);

      case EffectType.District:
        return this.applyDistrict(state, effect);

      case EffectType.Motivation:
        return this.applyMotivation(state, effect);

      default:
        return null;
    }
  }

  private applyPartySwing(
    state: GameState,
    appliedEffects: Extract<AppliedEffect, { type: EffectType.PartySwing }>,
  ) {
    const candidateListData =
      this.nationalSwingTransform.applyNationalSwingToDistricts(
        state.candidateListData,
        appliedEffects?.baseShare,
        appliedEffects?.targetShare,
      );
    const partyListData = this.nationalSwingTransform.applyNationalSwingToList(
      state.partyListData,
      appliedEffects.baseShare,
      appliedEffects.targetShare,
    );

    return { candidateListData, partyListData };
  }

  private applyShares(
    state: GameState,
    appliedEffects: Extract<AppliedEffect, { type: EffectType.PartyShare }>,
  ) {
    const result = this.pipelineTransform.distributeVotesByPartyShare(
      state.candidateListData,
      appliedEffects.newVotes,
      appliedEffects.share,
    );

    if (!result) {
      log.error("No result from distributeVotesByPartyShare");
      return null;
    }

    return {
      candidateListData: result.districts,
      partyListData: state.partyListData,
    };
  }

  private applyDistrict(
    state: GameState,
    appliedEffects: Extract<AppliedEffect, { type: EffectType.District }>,
  ) {
    const result = this.districtTargetTransform.modifyDistricts(
      state.candidateListData,
      appliedEffects.params,
    );

    return { candidateListData: result, partyListData: state.partyListData };
  }

  private applyMotivation(
    state: GameState,
    appliedEffects: Extract<AppliedEffect, { type: EffectType.Motivation }>,
  ) {
    const result = this.pipelineTransform.modifyByMotivation(
      state.candidateListData,
      state.partyListData,
      appliedEffects.motivationDelta,
    );

    return {
      candidateListData: result.newCandidateData,
      partyListData: result.newPartyData,
    };
  }

  modifyListDistricts(
    list: CandidateListData[],
    target: Record<string, number>,
  ) {
    return this.districtTargetTransform.modifyListDistricts(list, target);
  }
}
