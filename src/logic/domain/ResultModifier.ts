import type { GameState } from "./CampaignEngine";
import { type AppliedEffect, EffectType } from "./EffectApplier.types";
import { createLogger } from "../logger";
import { DistrictTargetTransform } from "./ResultTransformer/DistrictTargetTransform";
import { NationalSwingTransform } from "./ResultTransformer/NationalSwingTransform";
import { PipelineTransform } from "./ResultTransformer/PipelineTransform";
import type { CandidateListData } from "./ResultTransformer/PipelineTransform.types";
import { injectable } from "tsyringe";

const log = createLogger("ResultModifier");

@injectable()
export class ResultModifier {
  constructor(
    private nationalSwingTransform: NationalSwingTransform,
    private pipelineTransform: PipelineTransform,
    private districtTargetTransform: DistrictTargetTransform,
  ) {}

  apply(state: GameState, appliedEffects?: AppliedEffect): GameState | null {
    if (!appliedEffects) {
      log.error("No applied effects provided to ResultModifier");
      return null;
    }
    switch (appliedEffects.type) {
      case EffectType.PartySwing:
        return this.applyPartySwing(state, appliedEffects);
      case EffectType.PartyShare:
        return this.applyShares(state, appliedEffects);
      case EffectType.District:
        return this.applyDistrict(state, appliedEffects);
      case EffectType.Motivation:
        return this.applyMotivation(state, appliedEffects);
    }
  }

  private applyPartySwing(
    state: GameState,
    appliedEffects: Extract<AppliedEffect, { type: EffectType.PartySwing }>,
  ): GameState {
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
