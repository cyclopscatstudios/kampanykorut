import { ElectionConfigEngine } from "./domain/ElectionConfigEngine";
import { MandateCalculator } from "./domain/MandateCalculator";
import type {
  CalculateResults,
  ElectionConfig,
  PartyId,
} from "./domain/MandateCalculator.types";
import { ResultModifier } from "./domain/ResultModifier";
import { DistrictVoteTransformer } from "./domain/ResultTransformer/DistrictVoteTransformer";
import { UnionSwingTransformer } from "./domain/ResultTransformer/UnionSwingTransformer";
import { VoteShareTransformer } from "./domain/ResultTransformer/VoteShareTransformer";
import type {
  Shares,
  CandidateListData,
  PartyListData,
  DistrictTarget,
} from "./domain/ResultTransformer/VoteShareTransformer.types";
import {
  VoterEnvironment,
  type VoterEnvironmentConfig,
} from "./VoterEnvironment";

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
  private nationalSwingTransform: UnionSwingTransformer;
  private pipelineTransform: VoteShareTransformer;
  private dsitrictTargetTransform: DistrictVoteTransformer;
  private voterEnvironment: VoterEnvironment;
  private electionConfigEngine: ElectionConfigEngine;

  constructor(
    private electionConfig: ElectionConfig,
    private voterEnvironmentConfig: VoterEnvironmentConfig,
  ) {
    this.electionConfigEngine = new ElectionConfigEngine(this.electionConfig);
    this.voterEnvironment = new VoterEnvironment(voterEnvironmentConfig);
    this.mandateCalculator = new MandateCalculator(this.electionConfigEngine);
    this.dsitrictTargetTransform = new DistrictVoteTransformer(
      this.voterEnvironment,
    );
    const nationalSwingTransform = new UnionSwingTransformer();
    this.pipelineTransform = new VoteShareTransformer(
      this.voterEnvironmentConfig,
    );
    this.resultModifier = new ResultModifier(
      nationalSwingTransform,
      this.pipelineTransform,
      this.dsitrictTargetTransform,
    );
    this.nationalSwingTransform = new UnionSwingTransformer();
  }

  /**
   * Applies a national vote swing based on target party shares and updates
   * both constituency- and list-level datasets.
   * @param {Shares} baseShare
   *   Original national vote share ratios used as the reference baseline.
   * @param {Shares} targetShare
   *   Desired national vote share ratios to apply.
   * @returns {{
   *   newDistrictData: CandidateListData[];
   *   newListData: PartyListData[];
   * }}
   */
  modifyByTarget(
    baseShare: Shares,
    targetShare: Shares,
    districtCandidateData: CandidateListData[],
    districtPartyData: PartyListData[],
  ) {
    const newCandidateData =
      this.nationalSwingTransform.applyUniformSwingToDistricts(
        districtCandidateData,
        baseShare,
        targetShare,
      );

    const newPartyData = this.nationalSwingTransform.applyUniformSwingToList(
      districtPartyData,
      districtCandidateData,
      baseShare,
      targetShare,
    );

    return { newCandidateData, newPartyData };
  }

  /**
   * Distributes a fixed total number of votes among parties according to
   * predefined share ratios, and allocates those votes across districts
   * using party-specific weighting.
   * @param {PartyListData[]} listData
   *   Input district list containing existing party vote data.
   * @param {number} newVotes
   *   Total number of votes to be distributed across all parties.
   * @param {Shares} shares
   *   Mapping of party → share ratio (0–1).
   * @returns {{
   *   districts: CandidateListData[];
   *   totals: Record<string, number>;
   *   percentages: Shares;
   *   totalVotes: number;
   * }}
   */
  modifyByShare(
    districtCandidateData: CandidateListData[],
    partyListData: PartyListData[],
    newVotes: number,
    shares: Shares,
  ) {
    const result = this.pipelineTransform.distributeVotesByPartyShare(
      districtCandidateData,
      partyListData,
      newVotes,
      shares,
    );

    if (!result) {
      return null;
    }

    return {
      candidateList: result.candidateList,
      partyList: result.partyList,
    };
  }

  /**
   * Transfers a given number of votes to a target party inside a single district.
   * @param {PartyListData[]} listData
   *   List of district-level party vote records.
   * @param {DistrictTarget[]} districtTarget
   *   List of district-level target.
   *
   * modifyDistricts([{"megyekod": 1, "oevk": 1, "fidesz": 1000}], 1, 1, "fidesz", 5000) -> [{"megyekod": 1, "oevk": 1, "fidesz": 6000}]
   */
  modifyDistrict(
    districtCandidateData: CandidateListData[],
    partyListData: PartyListData[],
    districtTarget: DistrictTarget[],
  ) {
    return this.dsitrictTargetTransform.modifyDistricts(
      districtCandidateData,
      partyListData,
      districtTarget,
    );
  }

  /**
   * Applies fixed party vote values to all districts in the list.
   * This function performs a shallow overwrite only; it does not redistribute
   * votes or preserve totals.
   * @param {CandidateListData[]} list
   *   Array of constituency records to be updated.
   * @param {Record<string, number>} target
   *   Mapping of party identifiers to absolute vote counts.
   * @returns {CandidateListData[]}
   *   A new array where each district contains the merged party vote values.
   *
   * modifyListDistrict([{ "party-a": 10 }], { "party-a": 90 }) -> [{ "party-a": 90, ... }]
   */
  modifyList(
    districtCandidateData: CandidateListData[],
    target: Record<string, number>,
  ) {
    return this.resultModifier.modifyListDistricts(
      districtCandidateData,
      target,
    );
  }

  modifyByMotivation(
    districtCandidateData: CandidateListData[],
    districtPartyData: PartyListData[],
    motivationDelta: Record<PartyId, number>,
  ) {
    return this.pipelineTransform.modifyByMotivation(
      districtCandidateData,
      districtPartyData,
      motivationDelta,
    );
  }

  /**
   * Calculates the full election result based on constituency and party list data.
   * @param {CandidateListData[]} updatedConstituencyData
   *   Constituency-level election input data (one record per OEVK).
   * @param {PartyListData[]} updatedListData
   *   Party list vote data used for national aggregation and percentage calculation.
   * @returns {CalculateResults}
   *   The calculated election results including mandates, seat distribution,
   *   compensation details, and vote percentages.
   */
  calculate(
    districtCandidateData: CandidateListData[],
    districtPartyData: PartyListData[],
  ): CalculateResults | undefined {
    return this.mandateCalculator.calculate(
      districtCandidateData,
      districtPartyData,
    );
  }
}
