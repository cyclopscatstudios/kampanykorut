import {
  CalculateResults,
  CandidateListData,
  Mandate,
  ParliamentaryElectionConfig,
  PartyVotes,
  ProportionalElectionDefinition,
  RegionSeatResult,
} from "../types";
import { calcPercentages } from "./ResultModifier.utils";

export interface DHondtResult {
  allocation: Record<string, number>;
  // The quotient that won the last seat; votes beyond seats * this value are
  // the party's unused (fractional) votes.
  lastQuotient: number;
}

export function allocateDHondt(votes: PartyVotes, seats: number): DHondtResult {
  const quotients: { party: string; value: number; votes: number }[] = [];
  for (const [party, v] of Object.entries(votes)) {
    if (v <= 0) {
      continue;
    }
    for (let d = 1; d <= seats; d++) {
      quotients.push({ party, value: v / d, votes: v });
    }
  }
  quotients.sort(
    (a, b) =>
      b.value - a.value ||
      b.votes - a.votes ||
      (a.party < b.party ? -1 : a.party > b.party ? 1 : 0),
  );

  const allocation: Record<string, number> = {};
  const winners = quotients.slice(0, seats);
  for (const q of winners) {
    allocation[q.party] = (allocation[q.party] ?? 0) + 1;
  }
  return { allocation, lastQuotient: winners.at(-1)?.value ?? 0 };
}

export function isProportionalElection(
  config: Pick<ParliamentaryElectionConfig, "election"> | undefined,
): config is ParliamentaryElectionConfig & {
  election: ProportionalElectionDefinition;
} {
  return config?.election?.type === "proportional";
}

function isBallotParty(party: string) {
  return !party.startsWith("_");
}

function sumVotes(rows: CandidateListData[]): PartyVotes {
  const votes: PartyVotes = {};
  for (const row of rows) {
    for (const [party, v] of Object.entries(row.partok ?? {})) {
      if (Number.isFinite(v) && v) {
        votes[party] = (votes[party] ?? 0) + (v as number);
      }
    }
  }
  return votes;
}

function pick(votes: PartyVotes, parties: Set<string>): PartyVotes {
  return Object.fromEntries(
    Object.entries(votes).filter(([party]) => parties.has(party)),
  );
}

function withTotal(votes: PartyVotes): Record<string, number> {
  return {
    ...votes,
    _total: Object.values(votes).reduce((sum, v) => sum + v, 0),
  };
}

export function calculateProportionalResults(
  candidateListData: CandidateListData[],
  config: ParliamentaryElectionConfig & {
    election: ProportionalElectionDefinition;
  },
): CalculateResults {
  const nationalVotes = sumVotes(candidateListData);
  const nationalTotal = Object.values(nationalVotes).reduce((a, b) => a + b, 0);
  const eligible = new Set(
    Object.entries(nationalVotes)
      .filter(
        ([party, v]) =>
          isBallotParty(party) &&
          nationalTotal > 0 &&
          (v / nationalTotal) * 100 >= config.thresholdPercent,
      )
      .map(([party]) => party),
  );

  const regionalSeats: Record<string, number> = {};
  const unusedVotes: PartyVotes = {};
  const regions: RegionSeatResult[] = config.election.regions.map((region) => {
    const counties = new Set(region.megyekods);
    const votes = sumVotes(
      candidateListData.filter((row) => counties.has(row.megyekod)),
    );
    const { allocation, lastQuotient } = allocateDHondt(
      pick(votes, eligible),
      region.seats,
    );
    for (const party of eligible) {
      const won = allocation[party] ?? 0;
      regionalSeats[party] = (regionalSeats[party] ?? 0) + won;
      unusedVotes[party] =
        (unusedVotes[party] ?? 0) +
        Math.max(0, (votes[party] ?? 0) - won * lastQuotient);
    }
    return {
      id: region.id,
      name: region.name,
      seats: region.seats,
      votes,
      allocation,
    };
  });

  const { allocation: nationalSeats } = allocateDHondt(
    unusedVotes,
    config.listSeats,
  );

  const mandates: Mandate[] = Object.keys(nationalVotes)
    .filter(isBallotParty)
    .map((party) => {
      const regional = regionalSeats[party] ?? 0;
      const national = nationalSeats[party] ?? 0;
      return {
        party,
        constituencySeats: regional,
        listSeats: national,
        totalSeats: regional + national,
      };
    });

  const totals = withTotal(nationalVotes);
  const percentages = calcPercentages(totals);
  return {
    totals: { candidateListResults: totals, partyListResults: totals },
    percentages: {
      candidateListResults: percentages,
      partyListResults: percentages,
    },
    mandates,
    constituencySeats: regionalSeats,
    listSeats: nationalSeats,
    compensation: {
      losingVotes: unusedVotes,
      winnerCompensation: {},
      total: unusedVotes,
    },
    regions,
  };
}
