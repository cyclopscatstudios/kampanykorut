import { ConditionalAnswer } from "./answer";

export interface AnswerFeedback {
  answerId: string;
  text: string;
}

export interface AdvisorFeedbackAssets {
  primaryAdvisorImageUri: string;
  secondaryAdvisorImageUri: string;
}

export interface AdvisorFeedback {
  questionId: string;
  answers: AnswerFeedback[];
  conditionalAnswers?: ConditionalAnswer[];
}
