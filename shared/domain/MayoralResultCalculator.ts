import { injectable } from "tsyringe";
import {
  CandidateListData,
  MayoralDistrictResult,
  MayoralOutcome,
  MayoralResult,
  MayoralStanding,
  MayoralTally,
} from "../types";

export interface MayoralCalculationOptions {
  inactiveCandidateIds?: Iterable<string>;
}

const isAggregateKey = (key: string) => key.startsWith("_");

// Plurality vote for a single city-wide office. Districts are only the unit of
// the simulation: their raw votes are summed, never their percentages, and no
// district is "won" in a way that counts towards the result.
//
// Votes still recorded for an inactive (e.g. withdrawn) candidate are invalid,
// as with a crossed-out name on the ballot, so they are reported separately and
// left out of the valid total.
@injectable()
export class MayoralResultCalculator {
  calculate(
    districts: CandidateListData[],
    options: MayoralCalculationOptions = {},
  ): MayoralResult {
    const inactive = new Set(options.inactiveCandidateIds ?? []);
    const cityVotes: Record<string, number> = {};
    let eligibleVoters = 0;

    const districtResults = districts.map((district) => {
      const votes = this.cleanVotes(district.partok);
      for (const [id, count] of Object.entries(votes)) {
        cityVotes[id] = (cityVotes[id] ?? 0) + count;
      }
      eligibleVoters += district.valasztopolgar ?? 0;

      const result: MayoralDistrictResult = {
        megyekod: district.megyekod,
        oevk: district.oevk,
        label: district.telepules,
        eligibleVoters: district.valasztopolgar ?? 0,
        ...this.tally(votes, inactive),
      };
      return result;
    });

    return {
      eligibleVoters,
      districts: districtResults,
      ...this.tally(cityVotes, inactive),
    };
  }

  private tally(
    allVotes: Record<string, number>,
    inactive: Set<string>,
  ): MayoralTally {
    const votes: Record<string, number> = {};
    const withdrawn: MayoralTally["withdrawn"] = [];

    for (const [id, count] of Object.entries(allVotes)) {
      if (inactive.has(id)) {
        withdrawn.push({ candidateId: id, votes: count });
      } else {
        votes[id] = count;
      }
    }

    const validVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
    const percentages = Object.fromEntries(
      Object.entries(votes).map(([id, count]) => [
        id,
        validVotes > 0 ? count / validVotes : 0,
      ]),
    );

    const standings: MayoralStanding[] = Object.entries(votes)
      .filter(([id]) => !isAggregateKey(id))
      .map(([candidateId, count]) => ({
        candidateId,
        votes: count,
        share: percentages[candidateId],
      }))
      .sort(compareStandings);

    return {
      validVotes,
      votes,
      percentages,
      standings,
      withdrawn: withdrawn.sort((a, b) =>
        compareIds(a.candidateId, b.candidateId),
      ),
      outcome: this.getOutcome(standings),
      margin: this.getMargin(standings),
    };
  }

  private getOutcome(standings: MayoralStanding[]): MayoralOutcome {
    const top = standings[0];
    if (!top || top.votes <= 0) {
      return { kind: "no_winner" };
    }
    const leaders = standings.filter((s) => s.votes === top.votes);
    if (leaders.length > 1) {
      return { kind: "tie", candidateIds: leaders.map((s) => s.candidateId) };
    }
    return { kind: "winner", candidateId: top.candidateId };
  }

  private getMargin(standings: MayoralStanding[]) {
    const [first, second] = standings;
    if (!first || !second) {
      return undefined;
    }
    return {
      votes: first.votes - second.votes,
      percentagePoints: (first.share - second.share) * 100,
    };
  }

  private cleanVotes(partok: CandidateListData["partok"]) {
    const out: Record<string, number> = {};
    for (const [id, value] of Object.entries(partok ?? {})) {
      if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        out[id] = value;
      }
    }
    return out;
  }
}

function compareIds(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareStandings(a: MayoralStanding, b: MayoralStanding) {
  return b.votes - a.votes || compareIds(a.candidateId, b.candidateId);
}
