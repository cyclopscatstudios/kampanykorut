import { createLogger } from "../../logger";
import {
  CandidateListData,
  PartyListData,
  PartyListVotes,
  Share,
} from "../../types";

const log = createLogger("NationalSwingTransform");

export class UnionSwingTransformer {
  applyUniformSwingToList(
    districtPartyData: PartyListData[],
    districtCandidateData: CandidateListData[],
    baseShare: Share,
    targetShare: Share,
  ) {
    return districtPartyData.map((district) => {
      const voterCapacity = this.getVoterCapacity(
        districtCandidateData,
        district,
      );
      const swingVotes = this.getAppliedSwing(
        baseShare,
        targetShare,
        district.partok,
        voterCapacity,
      );
      return {
        ...district,
        partok: {
          ...district.partok,
          ...swingVotes,
        },
      };
    });
  }

  applyUniformSwingToDistricts(
    districtCandidateData: CandidateListData[],
    baseShare: Share,
    targetShare: Share,
  ) {
    return districtCandidateData.map((district) => {
      const swingVotes = this.getAppliedSwing(
        baseShare,
        targetShare,
        district.partok,
        district.valasztopolgar,
      );

      return {
        ...district,
        partok: {
          ...district.partok,
          ...swingVotes,
        },
      };
    });
  }

  applyUniformSwingToListVotes(
    baseShare: Share,
    targetShare: Share,
    partyListVotes?: PartyListVotes,
  ): PartyListVotes | undefined {
    if (!partyListVotes) {
      return;
    }
    const partyDiffs = this.getDiff(baseShare, targetShare);
    const total = this.sumVotes(partyListVotes);

    const newVotes: PartyListVotes = {};

    const parties = new Set([
      ...Object.keys(partyListVotes),
      ...Object.keys(partyDiffs),
    ]);

    for (const party of parties) {
      const share =
        total > 0 ? ((partyListVotes[party] ?? 0) / total) * 100 : 0;
      const newShare = share + (partyDiffs[party] ?? 0);

      newVotes[party] = Math.max(0, Math.round((newShare / 100) * total));
    }

    return newVotes;
  }

  private getAppliedSwing(
    baseShare: Record<string, number>,
    targetShare: Record<string, number>,
    parties: Record<string, number | undefined>,
    capacity: number,
  ) {
    const partyDiffs = this.getDiff(baseShare, targetShare);
    const newVotes = this.applyDiffToDistrict(parties, partyDiffs);
    const sumNewVotes = this.sumVotes(newVotes);

    if (sumNewVotes > capacity) {
      log.error("swing exceeds capacity, change ignored");
      return parties;
    }

    return newVotes;
  }

  private getVoterCapacity(
    candidateList: CandidateListData[],
    district: PartyListData,
  ) {
    return (
      candidateList.find(
        (list) =>
          list.megyekod === district.megyekod && list.oevk === district.oevk,
      )?.valasztopolgar ?? 0
    );
  }

  private getDiff(
    baseShare: Record<string, number>,
    targetShare: Record<string, number>,
  ): Record<string, number> {
    const diff: Record<string, number> = {};

    const parties = new Set([
      ...Object.keys(baseShare),
      ...Object.keys(targetShare),
    ]);

    for (const p of parties) {
      const base = baseShare[p] ?? 0;
      const target = targetShare[p] ?? base;
      diff[p] = target - base;
    }

    return diff;
  }

  private applyDiffToDistrict(
    votes: Record<string, number | undefined>,
    partyDiffs: Record<string, number>,
  ) {
    const result: Record<string, number | undefined> = { ...votes };

    const total = Object.values(votes).reduce((a, b) => (a ?? 0) + (b ?? 0), 0);

    for (const party of Object.keys(partyDiffs)) {
      const diffPercent = partyDiffs[party];

      if (!diffPercent) {
        continue;
      }

      const deltaVotes = Math.round((total ?? 0) * (diffPercent / 100));
      const oldVotes = result[party] ?? 0;

      const newVotes = oldVotes + deltaVotes;

      result[party] = Math.max(0, newVotes);
    }

    return result;
  }

  private sumVotes(votes: Record<string, number | undefined>): number {
    let total = 0;

    for (const v of Object.values(votes)) {
      if (typeof v === "number" && !Number.isNaN(v)) {
        total += v;
      }
    }

    return total;
  }
}
