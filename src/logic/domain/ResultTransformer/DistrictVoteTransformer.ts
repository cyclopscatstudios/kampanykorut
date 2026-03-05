import { VoterEnvironment } from "../../VoterEnvironment";
import { getCapacity } from "../ResultModifier.utils";
import type {
  CandidateListData,
  DistrictTarget,
  PartyListData,
  VoteSource,
} from "./VoteShareTransformer.types";

export class DistrictVoteTransformer {
  constructor(private voterEnvironment: VoterEnvironment) {}

  modifyDistricts(
    districtCandidateData: CandidateListData[],
    partyListData: PartyListData[],
    districtTargets: DistrictTarget[],
  ) {
    const newPartyListData = districtTargets.reduce(
      (currentList, target) =>
        currentList.map((row) =>
          this.applyPartyTarget(row, districtCandidateData, target),
        ),
      partyListData,
    );
    const newCandidateListData = districtTargets.reduce(
      (currentList, target) =>
        currentList.map((row) => this.applyCandidateTarget(row, target)),
      districtCandidateData,
    );
    return {
      newCandidateListData,
      newPartyListData,
    };
  }

  modifyListDistricts(
    list: CandidateListData[],
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

  private applyPartyTarget(
    partyListData: PartyListData,
    districtCandidateData: CandidateListData[],
    target: DistrictTarget,
  ) {
    if (
      partyListData.megyekod !== target.megyekod ||
      partyListData.oevk !== target.oevk
    ) {
      // TODO log error war for incorrect target
      return partyListData;
    }

    const from: VoteSource = target.from ?? { type: "bizonytalan" };
    const partok = { ...partyListData.partok };

    let available = 0;

    if (from.type === "bizonytalan") {
      available =
        getCapacity(
          districtCandidateData,
          partyListData.oevk,
          partyListData.megyekod,
        )?.valasztopolgar ?? 0;
    } else {
      available = partok[from.party] ?? 0;
    }

    const transfer = Math.max(0, Math.min(target.amount, available));

    if (transfer === 0) {
      return partyListData;
    }

    if (from.type !== "bizonytalan") {
      partok[from.party] = (partok[from.party] ?? 0) - transfer;
    }

    partok[target.targetParty] = (partok[target.targetParty] ?? 0) + transfer;

    return {
      ...partyListData,
      partok,
    };
  }

  private applyCandidateTarget(
    districtCandidateData: CandidateListData,
    target: DistrictTarget,
  ) {
    if (
      districtCandidateData.megyekod !== target.megyekod ||
      districtCandidateData.oevk !== target.oevk
    ) {
      // TODO log error war for incorrect target
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
