import { Condition } from "./condition";

export interface RawQuestion {
  id: string;
  title?: string;
  question: string;
  possibleAnswers: {
    id: string;
    label: string;
  }[];
  affects?: { id: string }[];
  requires?: { questionId: string; answerId: string }[];
  blocks?: { questionId: string; answerId: string }[];
  visibleIf?: Condition;
  // Id of the question this one may randomly replace; it is shown at its own position.
  alternativeTo?: string;
}

// Main question id -> the id of the variant drawn for this playthrough.
export type QuestionVariants = Record<string, string>;
