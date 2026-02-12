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
import { createLogger } from "../logger";

const log = createLogger("EffectApplier");

export class EffectApplier {
  private mandateCalculator: MandateCalculator;
  private EPSILON = 0.000001;
  private DEFAULT_MOTIVATION_DELTA = 99;

  constructor(electionConfig: ElectionConfig) {
    this.mandateCalculator = new MandateCalculator(electionConfig);
  }

  getAppliedEffects(
    effects: RawEffect[],
    candidateListData: CandidateListData[],
  ): AppliedEffect[] {
    let appliedEffects: AppliedEffect[] = [];

    effects.forEach((effect) => {
      switch (effect.type) {
        case EffectType.PartySwing:
          appliedEffects = [
            ...appliedEffects,
            this.getPartySwingShares(effect.params, candidateListData),
          ];
          break;
        case EffectType.PartyShare:
          appliedEffects = [
            ...appliedEffects,
            this.getPartyShare(effect.params),
          ];
          break;
        case EffectType.District:
          appliedEffects = [
            ...appliedEffects,
            this.getDistrictChange(effect.params),
          ];
          break;
        case EffectType.Motivation:
          appliedEffects = [
            ...appliedEffects,
            this.getMotivationChange(effect.params),
          ];
          break;
      }
    });

    return appliedEffects;
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

    const deltas = Object.entries(params)
      .filter(([party]) => baseShare[party] !== undefined)
      .map(([party, value]) => ({
        party,
        delta: Number(value) / 100,
      }));

    const deltaSum = deltas.reduce((a, b) => a + b.delta, 0);

    if (Math.abs(deltaSum) > this.EPSILON) {
      log.error(`PartySwing delta must sum to 0. Current sum: ${deltaSum}`);
    }

    for (const { party, delta } of deltas) {
      const next = baseShare[party] + delta;

      if (next < 0) {
        log.error(`PartySwing pushed ${party} below 0`);
      }

      target[party] = next;
    }

    return target;
  }

  private getPartyShare(params: PartyShareParams): AppliedEffect {
    const newVotes = params.newVotes;
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

      delta[party] = this.DEFAULT_MOTIVATION_DELTA + percentage;

      if (delta[party] > 100) {
        log.error(`delta number for ${party} cannot be bigger then 100`);
        delta[party] = 100;
      }
    }
    return delta;
  }
}
