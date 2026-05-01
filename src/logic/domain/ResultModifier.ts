import type { CampaignState } from "./CampaignEngine";
import { createLogger } from "../logger";
import { DistrictVoteTransformer } from "./ResultTransformer/DistrictVoteTransformer";
import { UnionSwingTransformer } from "./ResultTransformer/UnionSwingTransformer";
import { VoteShareTransformer } from "./ResultTransformer/VoteShareTransformer";
import type { CandidateListData } from "./ResultTransformer/VoteShareTransformer.types";
import { EffectType, type AppliedEffect } from "../types/campaignEngine.types";
import { inject } from "tsyringe";

const log = createLogger("ResultModifier");

export class ResultModifier {
  constructor(
    @inject(UnionSwingTransformer)
    private unionSwingTransformer: UnionSwingTransformer,
    @inject(VoteShareTransformer)
    private voterShareTransformer: VoteShareTransformer,
    @inject(DistrictVoteTransformer)
    private districtVoteTransformer: DistrictVoteTransformer,
  ) {
    log.debug("ResultModifier initialized");
  }

  apply(
    state: CampaignState,
    appliedEffects?: AppliedEffect[],
  ): Pick<CampaignState, "candidateListData" | "partyListData"> | null {
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
    state: CampaignState,
    effect: AppliedEffect,
  ): Pick<CampaignState, "candidateListData" | "partyListData"> | null {
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
    state: CampaignState,
    appliedEffects: Extract<AppliedEffect, { type: EffectType.UniformSwing }>,
  ) {
    log.info("Applying uniform swing", { appliedEffects });
    const candidateListData =
      this.unionSwingTransformer.applyUniformSwingToDistricts(
        state.candidateListData ?? [],
        appliedEffects?.baseShare,
        appliedEffects?.targetShare,
      );
    const partyListData = this.unionSwingTransformer.applyUniformSwingToList(
      state.partyListData ?? [],
      state.candidateListData ?? [],
      appliedEffects.baseShare,
      appliedEffects.targetShare,
    );

    return { candidateListData, partyListData };
  }

  private applyShares(
    state: CampaignState,
    appliedEffects: Extract<AppliedEffect, { type: EffectType.VoteAllocation }>,
  ) {
    log.info("Applying vote allocation", { appliedEffects });
    const result = this.voterShareTransformer.distributeVotesByPartyShare(
      state.candidateListData ?? [],
      state.partyListData ?? [],
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
    state: CampaignState,
    appliedEffects: Extract<
      AppliedEffect,
      { type: EffectType.DistrictVoteTransfer }
    >,
  ) {
    log.info("Applying district vote transfer", { appliedEffects });
    const result = this.districtVoteTransformer.modifyDistricts(
      state.candidateListData ?? [],
      state.partyListData ?? [],
      appliedEffects.target,
    );
    return {
      candidateListData: result.newCandidateListData,
      partyListData: result.newPartyListData,
    };
  }

  private applyMotivation(
    state: CampaignState,
    appliedEffects: Extract<AppliedEffect, { type: EffectType.TurnoutChange }>,
  ) {
    log.info("Applying turnout change", { appliedEffects });
    const result = this.voterShareTransformer.modifyByMotivation(
      state.candidateListData ?? [],
      state.partyListData ?? [],
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
    return this.districtVoteTransformer.modifyListDistricts(list, target);
  }
}
