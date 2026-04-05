import type { GameState } from "./CampaignEngine";
import { createLogger } from "../logger";
import { DistrictVoteTransformer } from "./ResultTransformer/DistrictVoteTransformer";
import { UnionSwingTransformer } from "./ResultTransformer/UnionSwingTransformer";
import { VoteShareTransformer } from "./ResultTransformer/VoteShareTransformer";
import type { CandidateListData } from "./ResultTransformer/VoteShareTransformer.types";
import { EffectType, type AppliedEffect } from "../types/campaignEngine.types";

const log = createLogger("ResultModifier");

export class ResultModifier {
  constructor(
    private nationalSwingTransform: UnionSwingTransformer,
    private pipelineTransform: VoteShareTransformer,
    private districtTargetTransform: DistrictVoteTransformer,
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
      case EffectType.UniformSwing:
        return this.applyPartySwing(state, effect);

      case EffectType.VoteAllocation:
        return this.applyShares(state, effect);

      case EffectType.DistrictVoteTransfer:
        return this.applyDistrict(state, effect);

      case EffectType.TurnoutChange:
        return this.applyMotivation(state, effect);

      default:
        log.error("Unknown effect type in ResultModifier", { effect });
        return null;
    }
  }

  private applyPartySwing(
    state: GameState,
    appliedEffects: Extract<AppliedEffect, { type: EffectType.UniformSwing }>,
  ) {
    log.info("Applying uniform swing", { appliedEffects });
    const candidateListData =
      this.nationalSwingTransform.applyUniformSwingToDistricts(
        state.candidateListData,
        appliedEffects?.baseShare,
        appliedEffects?.targetShare,
      );
    const partyListData = this.nationalSwingTransform.applyUniformSwingToList(
      state.partyListData,
      state.candidateListData,
      appliedEffects.baseShare,
      appliedEffects.targetShare,
    );

    return { candidateListData, partyListData };
  }

  private applyShares(
    state: GameState,
    appliedEffects: Extract<AppliedEffect, { type: EffectType.VoteAllocation }>,
  ) {
    log.info("Applying vote allocation", { appliedEffects });
    const result = this.pipelineTransform.distributeVotesByPartyShare(
      state.candidateListData,
      state.partyListData,
      appliedEffects.newVotes,
      appliedEffects.share,
    );

    if (!result) {
      log.error("No result from distributeVotesByPartyShare");
      return null;
    }

    return {
      candidateListData: result.candidateList,
      partyListData: result.partyList,
    };
  }

  private applyDistrict(
    state: GameState,
    appliedEffects: Extract<
      AppliedEffect,
      { type: EffectType.DistrictVoteTransfer }
    >,
  ) {
    log.info("Applying district vote transfer", { appliedEffects });
    const result = this.districtTargetTransform.modifyDistricts(
      state.candidateListData,
      state.partyListData,
      appliedEffects.target,
    );
    return {
      candidateListData: result.newCandidateListData,
      partyListData: result.newPartyListData,
    };
  }

  private applyMotivation(
    state: GameState,
    appliedEffects: Extract<AppliedEffect, { type: EffectType.TurnoutChange }>,
  ) {
    log.info("Applying turnout change", { appliedEffects });
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
