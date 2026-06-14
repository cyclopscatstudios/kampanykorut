import { inject, singleton } from "tsyringe";
import {
  CandidateListData,
  DistrictTarget,
  PartyListData,
  VoteSource,
} from "@/shared/types";
import { createLogger } from "../../logger/logger";
import { VoterEnvironment } from "../VoterEnvironment";

const log = createLogger("DistrictVoteTransformer");

@singleton()
export class DistrictVoteTransformer {
  constructor(
    @inject(VoterEnvironment) private voterEnvironment: VoterEnvironment,
  ) {}

  modifyDistricts(
    districtCandidateData: CandidateListData[],
    partyListData: PartyListData[],
    districtTargets: DistrictTarget[],
  ) {
    const key = (megyekod: number, oevk: number) => `${megyekod}_${oevk}`;

    const partyIndex = new Map(
      partyListData.map((row, i) => [key(row.megyekod, row.oevk), i]),
    );
    const candidateIndex = new Map(
      districtCandidateData.map((row, i) => [key(row.megyekod, row.oevk), i]),
    );

    const newPartyListData = [...partyListData];
    const newCandidateListData = [...districtCandidateData];

    for (const target of districtTargets) {
      const k = key(target.megyekod, target.oevk);
      const pi = partyIndex.get(k);
      const ci = candidateIndex.get(k);

      if (pi === undefined) {
        log.warn(
          `provided target ${JSON.stringify(target)}'s district was not found in the party data`,
        );
      } else {
        newPartyListData[pi] = this.applyPartyTarget(
          newPartyListData[pi],
          ci !== undefined ? districtCandidateData[ci] : undefined,
          target,
        );
      }

      if (ci !== undefined) {
        newCandidateListData[ci] = this.applyCandidateTarget(
          newCandidateListData[ci],
          target,
        );
      }
    }

    return { newCandidateListData, newPartyListData };
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
    candidateData: CandidateListData | undefined,
    target: DistrictTarget,
  ) {
    const from: VoteSource = target.from ?? { type: "bizonytalan" };
    const partok = { ...partyListData.partok };

    let available = 0;

    if (from.type === "bizonytalan") {
      available = candidateData?.valasztopolgar ?? 0;
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
      log.warn(
        `provided target ${target}'s district was not found in the district data`,
      );
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
