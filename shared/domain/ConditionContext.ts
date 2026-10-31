import {
  CampaignState,
  ConditionContext,
  ElectionConfig,
  HistoryItem,
} from "../types";
import {
  getCampaignEventState,
  getCandidateStatus,
} from "./CampaignStateAccess";
import { isMayoralElection } from "./ElectionType";

export function createConditionContext(
  state: CampaignState,
  answers: Pick<HistoryItem, "questionId" | "answerId">[],
  electionConfig: ElectionConfig,
): ConditionContext {
  const ballotIds = new Set(electionConfig.parties.map((p) => p.id));
  const shares = isMayoralElection(electionConfig)
    ? state.mayoralResult?.percentages
    : state.results?.percentages.candidateListResults;

  return {
    turn: state.turn,
    answers,
    getSupport: (candidateId) =>
      shares && ballotIds.has(candidateId)
        ? (shares[candidateId] ?? 0)
        : undefined,
    getCandidateStatus: (candidateId) => getCandidateStatus(state, candidateId),
    triggeredEventIds: getCampaignEventState(state).triggeredEventIds,
  };
}
