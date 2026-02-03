import { ElectionEngine } from "./ElectionEngine";
import { MandateCalculator, type ElectionConfig } from "./MandateCalculator";
import type {
  CandidateListData,
  PartyListData,
  DistrictTarget,
  Shares,
} from "./ResultTransformer/PipelineTransform";
import type { VoterEnvironmentConfig } from "./VoterEnvironment";

export enum EffectType {
  PartySwing = "party-swing",
  PartyShare = "party-share",
  Motivation = "motivation",
  District = "district"
}

type PartyShareParams = {
  newVotoes: number;
  share: Record<string, number>;
};

export type Effect =
  | {
      type: EffectType.PartySwing;
      params: Record<string, number>;
    }
  | {
      type: EffectType.PartyShare;
      params: PartyShareParams;
    }
  | {
      type: EffectType.District;
      params: DistrictTarget[];
  }
  | {
      type: EffectType.Motivation;
      params: Record<string, number>;
    };

export class ElectionEffectApplier {
  private electionEngine: ElectionEngine;
  private mandateCalculator: MandateCalculator;
  private candidateData: CandidateListData[] = [];
  private partyData: PartyListData[] = [];

  constructor(
    electionConfig: ElectionConfig,
    voterEnvironmentConfig: VoterEnvironmentConfig,
    candidateData: CandidateListData[],
    partyData: PartyListData[],
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
      case EffectType.PartyShare:
        this.applyPartyShare(effect.params);
        break;
      case EffectType.District:
        this.applyDistrictChange(effect.params);
        break;
      case EffectType.Motivation:
        this.applyMotivationChange(effect.params);
        break;
    }
  }

  private applyDistrictChange(params: DistrictTarget[]) {
    this.electionEngine.modifyDistrict(this.candidateData, params);
  }

  private applyPartyShare(params: PartyShareParams) {
    this.electionEngine.modifyByShare(this.candidateData, params.newVotoes, params.share);
  }

  private applyMotivationChange(params: Record<string, number>) {
    const motivationDelta = this.getMotivationDelta(params);
    this.electionEngine.modifyByMotivation(
      this.candidateData,
      this.partyData,
      motivationDelta,
    );
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
}
