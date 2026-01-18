import {
  MandateCalculator,
  type CombinedOevk,
  type ElectionConfig,
} from "./MandateCalculator";
import {
  ResultModifier,
  type ConstituencyDataProps,
  type PartyListDataProps,
  type Shares,
} from "./ResultModifier";
import type { VoterEnvironmentConfig } from "./VoterEnvironment";

export type PartyId = string;

type PartyVotesRaw = Record<PartyId, number | undefined>;
type PartyVotes = Record<PartyId, number>;

type CandidateMapRaw = Record<PartyId, string[] | undefined>;
type CandidateMap = Record<PartyId, string[]>;

interface CalculateResults {
  totals: PartyVotes;
  mandates: Array<{
    party: string;
    constituencySeats: number;
    listSeats: number;
    totalSeats: number;
  }>;
  constituencySeats: Record<string, number>;
  listSeats: Record<string, number>;
  compensation: {
    losingVotes: PartyVotes;
    winnerCompensation: PartyVotes;
    total: PartyVotes;
  };
  percentages: Record<string, number>;
}

/**
 * Core election calculation engine.
 *
 * The `ElectionEngine` orchestrates all high-level election logic:
 * - merging constituency and list-level data
 * - applying national vote swings
 * - redistributing votes by fixed targets or shares
 * - calculating mandates (district + list)
 * - computing compensation votes and percentages
 *
 * It acts as a facade over lower-level components:
 * - {@link ResultModifier} for vote manipulation and redistribution
 * - {@link MandateCalculator} for seat allocation logic
 *
 * The engine itself is stateful only with respect to its input datasets
 * (`constituencyData`, `listData`) and configuration, but all transformation
 * methods return new immutable result objects.
 *
 * Typical workflow:
 * 1. Initialize with raw election data and configuration
 * 2. Apply transformations (national swing, vote redistribution, overrides)
 * 3. Call {@link calculate} to compute final mandates and statistics
 *
 * @example
 * ```ts
 * const engine = new ElectionEngine(constituencyData, listData, config);
 *
 * const { newDistricts, newList } = engine.modifyByTarget(
 *   baseShares,
 *   targetShares,
 * );
 *
 * const result = engine.calculate(newDistricts, newList);
 * ```
 */
export class ElectionEngine {
  private mandateCalculator: MandateCalculator;
  private resultModifier: ResultModifier;

  constructor(
    private constituencyData: ConstituencyDataProps[],
    private listData: PartyListDataProps[],
    private electionConfig: ElectionConfig,
    private voterEnvironmentConfig: VoterEnvironmentConfig,
  ) {
    this.mandateCalculator = new MandateCalculator(this.electionConfig);
    this.resultModifier = new ResultModifier(
      this.constituencyData,
      this.voterEnvironmentConfig,
    );
  }

  private merge(
    updatedData: ConstituencyDataProps[],
    updatedList: PartyListDataProps[],
  ) {
    const map = new Map<string, CombinedOevk>();

    for (const c of updatedData) {
      const key = `${c.megyekod}-${c.oevk}`;

      map.set(key, {
        megyekod: c.megyekod,
        megye: c.megye,
        oevk: c.oevk,
        constituencyVotes: this.cleanVotes(c.partok),
        listVotes: {},
        candidates: this.cleanCandidates(c.jeloltek),
      });
    }

    for (const l of updatedList) {
      const key = `${l.megyekod}-${l.oevk}`;
      const row = map.get(key);
      if (!row) {
        continue;
      }

      row.listVotes = this.cleanVotes(l.partok);
    }

    return [...map.values()];
  }

  private cleanVotes(votes: PartyVotesRaw) {
    const out: PartyVotes = {};
    for (const [party, value] of Object.entries(votes)) {
      if (typeof value === "number" && value > 0) {
        out[party] = value;
      }
    }
    return out;
  }

  private cleanCandidates(input?: CandidateMapRaw) {
    const out: CandidateMap = {};
    if (!input) {
      return out;
    }

    for (const [party, names] of Object.entries(input)) {
      if (Array.isArray(names) && names.length > 0) {
        out[party] = names;
      }
    }

    return out;
  }

  /**
   * Applies a national vote swing based on target party shares and updates
   * both constituency- and list-level datasets.
   * @param {Shares} baseShare
   *   Original national vote share ratios used as the reference baseline.
   * @param {Shares} targetShare
   *   Desired national vote share ratios to apply.
   * @returns {{
   *   newDistricts: ConstituencyDataProps[];
   *   newList: PartyListDataProps[];
   * }}
   */
  modifyByTarget(baseShare: Shares, targetShare: Shares) {
    const newDistricts = this.resultModifier.applyNationalSwingToDistricts(
      this.constituencyData,
      baseShare,
      targetShare,
    );

    const newList = this.resultModifier.applyNationalSwingToList(
      this.listData,
      baseShare,
      targetShare,
    );

    return { newDistricts, newList };
  }

  /**
   * Distributes a fixed total number of votes among parties according to
   * predefined share ratios, and allocates those votes across districts
   * using party-specific weighting.
   * @param {PartyListDataProps[]} listData
   *   Input district list containing existing party vote data.
   * @param {number} newVotes
   *   Total number of votes to be distributed across all parties.
   * @param {Shares} shares
   *   Mapping of party → share ratio (0–1).
   * @returns {{
   *   districts: ConstituencyDataProps[];
   *   totals: Record<string, number>;
   *   percentages: Shares;
   *   totalVotes: number;
   * }}
   */
  modifyByShare(
    listData: ConstituencyDataProps[],
    newVotes: number,
    shares: Shares,
  ) {
    const result = this.resultModifier.distributeVotesByPartyShare(
      listData,
      newVotes,
      shares,
    );

    if (!result) {
      return null;
    }

    return {
      updated: result.districts,
      percentages: result.percentages,
      totalVotes: result.totalVotes,
      totals: result.totals,
    };
  }

  /**
   * Transfers a given number of votes to a target party inside a single district.
   * @param {PartyListDataProps[]} listData
   *   List of district-level party vote records.
   * @param {number} megyekod
   *   County code identifying the district.
   * @param {number} oevk
   *   Constituency (OEVK) identifier within the county.
   * @param {string} targetParty
   *   Party identifier that receives the transferred votes.
   * @param {number} votes
   *   Number of votes to transfer.
   * @param {string} [from="bizonytalan"]
   *   Source of the transferred votes.
   * @returns {PartyListDataProps[]}
   *   New list where the matching district has updated party vote values.
   *
   * modifyDistricts([{"megyekod": 1, "oevk": 1, "fidesz": 1000}], 1, 1, "fidesz", 5000) -> [{"megyekod": 1, "oevk": 1, "fidesz": 6000}]
   */
  modifyDistrict(
    listData: ConstituencyDataProps[],
    megyekod: number,
    oevk: number,
    targetParty: string,
    votes: number,
    from?: string,
  ) {
    return this.resultModifier.modifyDistrict(
      listData,
      megyekod,
      oevk,
      targetParty,
      votes,
      from,
    );
  }

  /**
   * Applies fixed party vote values to all districts in the list.
   * This function performs a shallow overwrite only; it does not redistribute
   * votes or preserve totals.
   * @param {ConstituencyDataProps[]} list
   *   Array of constituency records to be updated.
   * @param {Record<string, number>} target
   *   Mapping of party identifiers to absolute vote counts.
   * @returns {ConstituencyDataProps[]}
   *   A new array where each district contains the merged party vote values.
   *
   * modifyListDistrict([{ "party-a": 10 }], { "party-a": 90 }) -> [{ "party-a": 90, ... }]
   */
  modifyList(
    constituencyData: ConstituencyDataProps[],
    target: Record<string, number>,
  ) {
    return this.resultModifier.modifyListDistricts(constituencyData, target);
  }

  modifyByMotivation(
    constituencyData: ConstituencyDataProps[],
    partyListData: PartyListDataProps[],
    motivationDelta: Record<PartyId, number>,
  ) {
    return this.resultModifier.modifyByMotivation(
      constituencyData,
      partyListData,
      motivationDelta,
    );
  }

  /**
   * Calculates the full election result based on constituency and party list data.
   * @param {ConstituencyDataProps[]} updatedConstituencyData
   *   Constituency-level election input data (one record per OEVK).
   * @param {PartyListDataProps[]} updatedListData
   *   Party list vote data used for national aggregation and percentage calculation.
   * @returns {CalculateResults}
   *   The calculated election results including mandates, seat distribution,
   *   compensation details, and vote percentages.
   */
  calculate(
    updatedConstituencyData: ConstituencyDataProps[],
    updatedListData: PartyListDataProps[],
  ): CalculateResults {
    const merged = this.merge(updatedConstituencyData, updatedListData);

    const constituencySeats =
      this.mandateCalculator.calculateConstituencySeats(merged);
    const compensation = this.mandateCalculator.calculateCompensation(merged);

    const listTotals: PartyVotes = {};
    for (const row of merged) {
      for (const [party, votes] of Object.entries(row.listVotes)) {
        listTotals[party] = (listTotals[party] ?? 0) + votes;
      }
    }

    const listSeats = this.mandateCalculator.allocateListSeats(
      listTotals,
      compensation.total,
    );

    const allParties = new Set([
      ...Object.keys(constituencySeats),
      ...Object.keys(listSeats),
    ]);

    const mandates = [];

    for (const party of allParties) {
      const oevk = constituencySeats[party] ?? 0;
      const list = listSeats[party] ?? 0;

      mandates.push({
        party,
        constituencySeats: oevk,
        listSeats: list,
        totalSeats: oevk + list,
      });
    }

    const totals = this.resultModifier.sumPartyTotals(updatedConstituencyData);
    const percentages = this.resultModifier.calculatePercentages(totals);

    return {
      totals,
      mandates,
      constituencySeats,
      listSeats,
      compensation,
      percentages,
    };
  }
}
