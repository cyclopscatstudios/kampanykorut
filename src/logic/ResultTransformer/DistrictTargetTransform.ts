import type {
  DistrictCandidateData,
  DistrictTarget,
  VoteSource,
} from "./PipelineTransform";
import {
  VoterEnvironment,
  type VoterEnvironmentConfig,
} from "../VoterEnvironment";

export class DistrictTargetTransform {
  private voterEnvironment: VoterEnvironment;

  constructor(voterEnviormentConfig: VoterEnvironmentConfig) {
    this.voterEnvironment = new VoterEnvironment(voterEnviormentConfig);
  }

  modifyDistricts(
    districtCandidateData: DistrictCandidateData[],
    districtTargets: DistrictTarget[],
  ) {
    return districtTargets.reduce(
      (currentList, target) =>
        currentList.map((row) => this.applyDistrictTarget(row, target)),
      districtCandidateData,
    );
  }

  modifyListDistricts(
    list: DistrictCandidateData[],
    target: Record<string, number>,
  ) {
    return list.map((row) => ({
      ...row,
      partok: {
        ...row.partok,
        ...target,
      },
    }));
  }

  private applyDistrictTarget(
    districtCandidateData: DistrictCandidateData,
    target: DistrictTarget,
  ): DistrictCandidateData {
    if (
      districtCandidateData.megyekod !== target.megyekod ||
      districtCandidateData.oevk !== target.oevk
    ) {
      return districtCandidateData;
    }

    const from: VoteSource = target.from ?? { type: "bizonytalan" };
    const partok = { ...districtCandidateData.partok };

    let available = 0;

    if (from.type === "bizonytalan") {
      available = this.voterEnvironment.getRemainingVoteCount(
        districtCandidateData,
      );
    } else {
      available = partok[from.party] ?? 0;
    }

    const transfer = Math.max(0, Math.min(target.amount, available));

    if (transfer === 0) {
      return districtCandidateData;
    }

    if (from.type !== "bizonytalan") {
      partok[from.party] = (partok[from.party] ?? 0) - transfer;
    }

    partok[target.targetParty] = (partok[target.targetParty] ?? 0) + transfer;

    return {
      ...districtCandidateData,
      partok,
    };
  }
}
