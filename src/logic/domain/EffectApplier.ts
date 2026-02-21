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
  DistrictTargetGroup,
} from "./ResultTransformer/VoteShareTransformer.types";
import { createLogger } from "../logger";
import { StateHandler } from "../application/StateHandler";

const log = createLogger("EffectApplier");

export class EffectApplier {
  private mandateCalculator: MandateCalculator;
  private stateHandler: StateHandler;
  private EPSILON = 0.000001;
  private DEFAULT_MOTIVATION_DELTA = 99;

  constructor(electionConfig: ElectionConfig, stateHandler: StateHandler) {
    this.mandateCalculator = new MandateCalculator(electionConfig);
    this.stateHandler = stateHandler;
  }

  getAppliedEffects(
    effects: RawEffect[],
    candidateListData: CandidateListData[],
  ): AppliedEffect[] {
    let appliedEffects: AppliedEffect[] = [];

    effects.forEach((effect) => {
      switch (effect.type) {
        case EffectType.UniformSwing:
          appliedEffects = [
            ...appliedEffects,
            this.getPartySwingShares(effect.params, candidateListData),
          ];
          break;
        case EffectType.VoteAllocation:
          appliedEffects = [
            ...appliedEffects,
            this.getPartyShare(effect.params),
          ];
          break;
        case EffectType.DistrictVoteTransfer:
          appliedEffects = [
            ...appliedEffects,
            this.getDistrictChange(effect.params),
          ];
          break;
        case EffectType.TurnoutChange:
          appliedEffects = [
            ...appliedEffects,
            this.getMotivationChange(effect.params),
          ];
          break;
        default:
          return this.handleEffectError();
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
    return { type: EffectType.UniformSwing, baseShare, targetShare };
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

    // TODO: consider deleting this check and handle swing differences in the class
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
    return { type: EffectType.VoteAllocation, newVotes, share };
  }

  private getDistrictChange(
    target: DistrictTarget[] | DistrictTargetGroup[],
  ): AppliedEffect {
    return { type: EffectType.DistrictVoteTransfer, target };
  }

  private getMotivationChange(params: Record<string, number>): AppliedEffect {
    const motivationDelta = this.getMotivationDelta(params);
    return { type: EffectType.TurnoutChange, motivationDelta };
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

  private handleEffectError() {
    const decision = this.stateHandler.get("turnDecision");
    log.error(
      `Provided effect type for answer id ${decision?.answerId} to question ${decision?.questionId} is not a valid effect`,
    );
    return null;
  }
}
