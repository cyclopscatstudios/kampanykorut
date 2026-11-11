import {
  CampaignState,
  ConditionContext,
  ElectionConfig,
  HistoryItem,
  Relation,
} from "../types";
import {
  getCampaignEventState,
  getCandidateStatus,
  getSelectedFocusIds,
} from "./CampaignStateAccess";
import { isMayoralElection } from "./ElectionType";

export function createConditionContext(
  state: CampaignState,
  answers: Pick<HistoryItem, "questionId" | "answerId">[],
  electionConfig: ElectionConfig,
  relations: Pick<Relation, "id" | "tone">[] = [],
): ConditionContext {
  const ballotIds = new Set(electionConfig.parties.map((p) => p.id));
  const shares = isMayoralElection(electionConfig)
    ? state.mayoralResult?.percentages
    : state.results?.percentages.candidateListResults;

  const standings = shares
    ? [...ballotIds]
        .filter((id) => getCandidateStatus(state, id) === "active")
        .map((candidateId) => ({
          candidateId,
          share: shares[candidateId] ?? 0,
        }))
        .sort(
          (a, b) =>
            b.share - a.share ||
            (a.candidateId < b.candidateId
              ? -1
              : a.candidateId > b.candidateId
                ? 1
                : 0),
        )
    : undefined;

  return {
    turn: state.turn,
    answers,
    getSupport: (candidateId) =>
      shares && ballotIds.has(candidateId)
        ? (shares[candidateId] ?? 0)
        : undefined,
    getStandings: () => standings,
    getCandidateStatus: (candidateId) => getCandidateStatus(state, candidateId),
    playerCandidateId: state.playerSide?.candidateId,
    triggeredEventIds: getCampaignEventState(state).triggeredEventIds,
    selectedFocusIds: getSelectedFocusIds(state),
    getRelationTone: (relationId) =>
      state.politicalDashboard?.relations?.[relationId]?.tone ??
      relations.find((r) => r.id === relationId)?.tone,
  };
}
