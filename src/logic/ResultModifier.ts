import type { PartyId } from "./ElectionEngine";
import type { ElectionConfig } from "./MandateCalculator";
import { DistrictTargetTransform } from "./ResultTransformer/DistrictTargetTransform";
import { NationalSwingTransform } from "./ResultTransformer/NationalSwingTransform";
import {
  PipelineTransform,
  type DistributedVotesResult,
  type CandidateListData,
  type PartyListData,
  type DistrictTarget,
  type Shares,
} from "./ResultTransformer/PipelineTransform";
import type { VoterEnvironmentConfig } from "./VoterEnvironment";

export class ResultModifier {
  private nationalSwingTransform: NationalSwingTransform;
  private pipelineTransform: PipelineTransform;
  private districtTargetTransform: DistrictTargetTransform;

  constructor(
    voterEnviormentConfig: VoterEnvironmentConfig,
    electionConfig: ElectionConfig,
  ) {
    this.nationalSwingTransform = new NationalSwingTransform();
    this.pipelineTransform = new PipelineTransform(
      voterEnviormentConfig,
      electionConfig,
    );
    this.districtTargetTransform = new DistrictTargetTransform(
      voterEnviormentConfig,
    );
  }

  applyNationalSwingToDistricts(
    districtCandidateData: CandidateListData[],
    baseShare: Shares,
    targetShare: Shares,
  ) {
    return this.nationalSwingTransform.applyNationalSwingToDistricts(
      districtCandidateData,
      baseShare,
      targetShare,
    );
  }

  applyNationalSwingToList(
    districtPartyData: PartyListData[],
    baseShare: Shares,
    targetShare: Shares,
  ) {
    return this.nationalSwingTransform.applyNationalSwingToList(
      districtPartyData,
      baseShare,
      targetShare,
    );
  }

  distributeVotesByPartyShare(
    districtCandidateData: CandidateListData[],
    totalVoters: number,
    partyShares: Shares,
  ): DistributedVotesResult | null {
    return this.pipelineTransform.distributeVotesByPartyShare(
      districtCandidateData,
      totalVoters,
      partyShares,
    );
  }

  modifyDistricts(
    districtCandidateData: CandidateListData[],
    districtTargets: DistrictTarget[],
  ) {
    return this.districtTargetTransform.modifyDistricts(
      districtCandidateData,
      districtTargets,
    );
  }

  modifyListDistricts(
    list: CandidateListData[],
    target: Record<string, number>,
  ) {
    return this.districtTargetTransform.modifyListDistricts(list, target);
  }

  modifyByMotivation(
    districtCandidateData: CandidateListData[],
    districtPartyData: PartyListData[],
    motivationTarget: Record<PartyId, number>,
  ) {
    return this.pipelineTransform.modifyByMotivation(
      districtCandidateData,
      districtPartyData,
      motivationTarget,
    );
  }
}
