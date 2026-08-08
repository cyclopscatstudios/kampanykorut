import { inject, singleton } from "tsyringe";
import { createLogger } from "../../logger";
import {
  CandidateListData,
  DistrictTarget,
  PartyListData,
  PartyListVotes,
  VoteSource,
} from "../../types";
import { VoterEnvironment } from "../VoterEnvironment";

const log = createLogger("DistrictVoteTransformer");

@singleton()
export class DistrictVoteTransformer {
  constructor(
    @inject(VoterEnvironment) private voterEnvironment: VoterEnvironment,
  ) {}

  modifyDistricts(
    districtCandidateData: CandidateListData[],
    districtTargets: DistrictTarget[],
    partyListData?: PartyListData[],
    partyListVotes?: PartyListVotes,
  ) {
    const key = (megyekod: number, oevk: number) => `${megyekod}_${oevk}`;

    const partyIndex = partyListData
      ? new Map(partyListData.map((row, i) => [key(row.megyekod, row.oevk), i]))
      : undefined;

    const candidateIndex = new Map(
      districtCandidateData.map((row, i) => [key(row.megyekod, row.oevk), i]),
    );

    const newPartyListData = partyListData ? [...partyListData] : undefined;
    const newCandidateListData = [...districtCandidateData];
    let newPartyListVotes = partyListVotes ? { ...partyListVotes } : undefined;

    for (const target of districtTargets) {
      const k = key(target.megyekod, target.oevk);
      const pi = partyIndex?.get(k);
      const ci = candidateIndex.get(k);

      if (partyListData?.length && newPartyListData?.length) {
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
      }

      if (ci !== undefined) {
        newCandidateListData[ci] = this.applyCandidateTarget(
          newCandidateListData[ci],
          target,
        );
      }

      if (newPartyListVotes) {
        newPartyListVotes = this.applyPartyListVotesTarget(
          newPartyListVotes,
          target,
        );
      }
    }

    return { newCandidateListData, newPartyListData, newPartyListVotes };
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

  private applyPartyListVotesTarget(
    partyListVotes: PartyListVotes,
    target: DistrictTarget,
  ): PartyListVotes {
    const from: VoteSource = target.from ?? { type: "bizonytalan" };
    const votes = { ...partyListVotes };

    let available = 0;

    if (from.type === "bizonytalan") {
      available = target.amount;
    } else {
      available = votes[from.party] ?? 0;
    }

    const transfer = Math.max(0, Math.min(target.amount, available));

    if (transfer === 0) {
      return partyListVotes;
    }

    if (from.type !== "bizonytalan") {
      votes[from.party] = (votes[from.party] ?? 0) - transfer;
    }

    votes[target.targetParty] = (votes[target.targetParty] ?? 0) + transfer;

    return votes;
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
