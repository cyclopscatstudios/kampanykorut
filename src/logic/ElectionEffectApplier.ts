import { ElectionEngine } from "./ElectionEngine";
import { MandateCalculator, type ElectionConfig } from "./MandateCalculator";
import type {
  DistrictCandidateData,
  DistrictPartyData,
  Shares,
} from "./ResultTransformer/PipelineTransform";
import type { VoterEnvironmentConfig } from "./VoterEnvironment";

export enum EffectType {
  PartySwing = "party-swing",
  PartyShare = "party-share",
}

export type Effect =
  | {
      type: EffectType.PartySwing;
      params: Record<string, number>;
    }
  | {
      type: EffectType.PartyShare;
      params: {
        newVotoes: number;
        share: Record<string, number>;
      };
    };

export class ElectionEffectApplier {
  private electionEngine: ElectionEngine;
  private mandateCalculator: MandateCalculator;
  private candidateData: DistrictCandidateData[] = [];
  private partyData: DistrictPartyData[] = [];

  constructor(
    electionConfig: ElectionConfig,
    voterEnvironmentConfig: VoterEnvironmentConfig,
    candidateData: DistrictCandidateData[],
    partyData: DistrictPartyData[],
  ) {
    this.electionEngine = new ElectionEngine(
      electionConfig,
      voterEnvironmentConfig,
    );
    this.mandateCalculator = new MandateCalculator(electionConfig);
    this.candidateData = candidateData;
    this.partyData = partyData;
  }

  applyEffect(effect: Effect) {
    switch (effect.type) {
      case EffectType.PartySwing:
        this.applyPartySwing(effect.params);
        break;
    }
  }

  private applyPartySwing(params: Record<string, number>) {
    const baseShare = this.getBaseShare();
    const targetShare = this.getTargetShare(baseShare, params);
    return this.electionEngine.modifyByTarget(
      baseShare,
      targetShare,
      this.candidateData,
      this.partyData,
    );
  }

  private getBaseShare() {
    const totals = this.mandateCalculator.sumPartyTotals(this.candidateData);
    return this.mandateCalculator.calculatePercentages(totals);
  }

  private getTargetShare(
    baseShare: Shares,
    params: Record<string, number>,
  ): Shares {
    const target: Shares = { ...baseShare };

    for (const [party, delta] of Object.entries(params)) {
      if (delta === undefined) continue;
      if (baseShare[party] === undefined) continue;

      target[party] = baseShare[party] + delta;
    }

    return target;
  }
}
