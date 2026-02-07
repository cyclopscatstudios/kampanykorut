import { injectable } from "tsyringe";
import {
  EffectType,
  type RawEffect,
  type AppliedEffect,
  type PartyShareParams,
} from "./EffectApplier.types";
import { MandateCalculator } from "./MandateCalculator";
import type { ElectionConfig } from "./MandateCalculator.types";
import type {
  CandidateListData,
  Shares,
  DistrictTarget,
} from "./ResultTransformer/PipelineTransform.types";

@injectable()
export class EffectApplier {
  private mandateCalculator: MandateCalculator;

  constructor(electionConfig: ElectionConfig) {
    this.mandateCalculator = new MandateCalculator(electionConfig);
  }

  getAppliedEffect(
    effect: RawEffect,
    candidateListData: CandidateListData[],
  ): AppliedEffect {
    switch (effect.type) {
      case EffectType.PartySwing:
        return this.getPartySwingShares(effect.params, candidateListData);
      case EffectType.PartyShare:
        return this.getPartyShare(effect.params);
      case EffectType.District:
        return this.getDistrictChange(effect.params);
      case EffectType.Motivation:
        return this.getMotivationChange(effect.params);
    }
  }

  getPartySwingShares(
    params: Record<string, number>,
    candidateListData: CandidateListData[],
  ): AppliedEffect {
    const baseShare = this.getBaseShare(candidateListData);
    const targetShare = this.getTargetShare(baseShare, params);
    return { type: EffectType.PartySwing, baseShare, targetShare };
  }

  private getBaseShare(candidateListData: CandidateListData[]) {
    const totals = this.mandateCalculator.sumPartyTotals(candidateListData);
    return this.mandateCalculator.calculatePercentages(totals);
  }

  private getTargetShare(
    baseShare: Shares,
    params: Record<string, number>,
  ): Shares {
    const target: Shares = { ...baseShare };

    for (const [party, delta] of Object.entries(params)) {
      if (delta === undefined) {
        continue;
      }
      if (baseShare[party] === undefined) {
        continue;
      }

      target[party] = baseShare[party] + delta;
    }

    return target;
  }

  private getPartyShare(params: PartyShareParams): AppliedEffect {
    const newVotes = params.newVotoes;
    const share = params.share;
    return { type: EffectType.PartyShare, newVotes, share };
  }

  private getDistrictChange(params: DistrictTarget[]): AppliedEffect {
    return { type: EffectType.District, params };
  }

  private getMotivationChange(params: Record<string, number>): AppliedEffect {
    const motivationDelta = this.getMotivationDelta(params);
    return { type: EffectType.Motivation, motivationDelta };
  }

  private getMotivationDelta(params: Record<string, number>) {
    const delta: Record<string, number> = { ...params };

    for (const [party, percentage] of Object.entries(delta)) {
      if (percentage === undefined) {
        continue;
      }

      delta[party] = 100 - percentage;
    }
    return delta;
  }
}
