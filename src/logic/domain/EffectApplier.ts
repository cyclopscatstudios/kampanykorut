import {
  EffectType,
  type RawEffect,
  type AppliedEffect,
  type PartyShareParams,
  type ConditionalRawEffect,
} from "./EffectApplier.types";
import { MandateCalculator } from "./MandateCalculator";
import type {
  CandidateListData,
  Shares,
  DistrictTarget,
  DistrictTargetGroup,
} from "./ResultTransformer/VoteShareTransformer.types";
import { createLogger } from "../logger";
import { StateHandler } from "../application/StateHandler";
import { DistrictGroupEngine, type DistrictGroup } from "./DistrictGroupEngine";
import type { GameConfigEngine } from "../application/GameConfigEngine";
import { container } from "tsyringe";
import type { DistrictResult } from "../../components/ui/map.utils";

const log = createLogger("EffectApplier");

export class EffectApplier {
  private mandateCalculator: MandateCalculator;
  private districtGroupEngine: DistrictGroupEngine;
  private stateHandler: StateHandler;
  private electionConfigEngine: GameConfigEngine;
  private DEFAULT_MOTIVATION_DELTA = 99;

  constructor(
    electionConfigEngine: GameConfigEngine,
    customGroups?: DistrictGroup[],
  ) {
    this.mandateCalculator = new MandateCalculator(electionConfigEngine);
    this.electionConfigEngine = electionConfigEngine;
    this.districtGroupEngine = new DistrictGroupEngine(customGroups);
    this.stateHandler = container.resolve(StateHandler);
  }

  getAppliedEffects(
    effects: RawEffect[],
    candidateListData: CandidateListData[],
    turn: number,
    conditionalEffects?: ConditionalRawEffect[],
    selectedDistrict?: DistrictResult | null,
  ): AppliedEffect[] {
    const resolvedEffects = this.resolveConditionalEffects(
      effects,
      conditionalEffects,
    );

    const appliedEffects: AppliedEffect[] = [];

    resolvedEffects.forEach((effect) => {
      switch (effect.type) {
        case EffectType.UniformSwing:
          appliedEffects.push(
            this.getPartySwingShares(effect.params, candidateListData),
          );
          break;

        case EffectType.VoteAllocation:
          appliedEffects.push(this.getPartyShare(effect.params));
          break;

        case EffectType.DistrictVoteTransfer:
          appliedEffects.push(this.getDistrictChange(effect.params));
          break;

        case EffectType.TurnoutChange:
          appliedEffects.push(this.getMotivationChange(effect.params));
          break;

        default:
          return this.handleEffectError(effect);
      }
    });

    const isDistrictBoosterAllowed =
      this.electionConfigEngine.getElectionConfig().districtBoost;

    const canApplyeBoosterEffect = turn % 2 === 0;

    if (
      isDistrictBoosterAllowed &&
      selectedDistrict &&
      canApplyeBoosterEffect
    ) {
      const boosterEffect = this.getBoosterEffect(selectedDistrict);
      if (boosterEffect) {
        log.info("Add boosterEffect to district ", selectedDistrict);
        return [...appliedEffects, boosterEffect];
      }
    }

    return appliedEffects;
  }

  private getBoosterEffect(district: DistrictResult): AppliedEffect | null {
    const palyerSide = this.electionConfigEngine.getElectionConfig().playerSide;
    if (!palyerSide) {
      return null;
    }
    const boosterTarget: DistrictTarget = {
      megyekod: district.megyekod,
      oevk: district.oevk,
      amount: 500,
      from: { type: "bizonytalan" },
      targetParty: palyerSide,
    };
    return { type: EffectType.DistrictVoteTransfer, target: [boosterTarget] };
  }

  private resolveConditionalEffects(
    baseEffects: RawEffect[],
    conditionalEffects?: ConditionalRawEffect[],
  ): RawEffect[] {
    if (!conditionalEffects?.length) {
      return baseEffects;
    }

    let finalEffects = [...baseEffects];
    const history = this.stateHandler.get("history");

    if (!history?.length) {
      log.error("history is empty, but conditional effects are present");
      return finalEffects;
    }

    for (const cond of conditionalEffects) {
      const matches = cond.if.every((condition) => {
        const h = history?.find((q) => q.questionId === condition.questionId);
        return h?.answerId === condition.answerId;
      });

      if (!matches) {
        log.info(`Condition not met for effects: ${JSON.stringify(cond)}`);
        continue;
      }

      if (cond.mode === "replace") {
        finalEffects = [...cond.effects];
      } else {
        finalEffects.push(...cond.effects);
      }
    }

    return finalEffects;
  }

  private getPartySwingShares(
    params: Record<string, number>,
    candidateListData: CandidateListData[],
  ): AppliedEffect {
    const baseShare = this.getBaseShare(candidateListData, params);
    const targetShare = this.getTargetShare(baseShare, params);
    return { type: EffectType.UniformSwing, baseShare, targetShare };
  }

  private getBaseShare(
    candidateListData: CandidateListData[],
    params: Record<string, number>,
  ) {
    const totals = this.mandateCalculator.sumPartyTotals(candidateListData);
    const partiesToPercentages = this.toPercentages(
      this.mandateCalculator.calculatePercentages(totals),
    );
    return this.filterOutParties(params, partiesToPercentages);
  }

  private filterOutParties(
    effectedParties: Record<string, number>,
    allParties: Record<string, number>,
  ) {
    return Object.fromEntries(
      Object.entries(allParties).filter(
        ([party]) => effectedParties[party] !== undefined,
      ),
    );
  }

  private toPercentages(obj: Record<string, number>): Record<string, number> {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, v * 100]),
    );
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
        delta: value,
      }));

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
    if (!this.isDistrictTargetGroup(target)) {
      return { type: EffectType.DistrictVoteTransfer, target };
    }

    const finalTarget = target.flatMap((t) =>
      this.districtGroupEngine
        .getDistrictTargetByGroupIds([t.groupId])
        .flatMap((d) =>
          d.districts.map((district) => ({
            megyekod: district.megyekod,
            oevk: district.oevk,
            amount: t.amount,
            targetParty: t.targetParty,
            from: t.from,
          })),
        ),
    );

    return { type: EffectType.DistrictVoteTransfer, target: finalTarget };
  }

  private isDistrictTargetGroup(
    target: DistrictTarget[] | DistrictTargetGroup[],
  ): target is DistrictTargetGroup[] {
    return target.length > 0 && "groupId" in target[0];
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

  private handleEffectError(effect: RawEffect) {
    const decision = this.stateHandler.get("turnDecision");
    log.error(
      `Provided effect type for answer id ${decision?.answerId} to question ${decision?.questionId} is not a valid effect: ${effect.type}`,
    );
    return null;
  }
}
