import {
  CampaignState,
  Condition,
  ElectionConfig,
  HistoryItem,
} from "../types";
import { createConditionContext } from "./ConditionContext";
import {
  ConditionEvaluationError,
  evaluateCondition,
} from "./ConditionEvaluator";

export type Answers = Pick<HistoryItem, "questionId" | "answerId">[];

// Returns a lazy checker for config conditions: a missing condition never
// holds, and one that cannot be decided yet (e.g. no results before the first
// poll) does not hold either.
export function createConditionCheck(
  state: CampaignState,
  answers: Answers,
  electionConfig: ElectionConfig,
): (condition?: Condition) => boolean {
  let context: ReturnType<typeof createConditionContext> | undefined;
  return (condition) => {
    if (!condition) {
      return false;
    }
    context ??= createConditionContext(state, answers, electionConfig);
    try {
      return evaluateCondition(condition, context);
    } catch (error) {
      if (error instanceof ConditionEvaluationError) {
        return false;
      }
      throw error;
    }
  };
}
