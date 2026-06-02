import { AnswerFeedback } from "./answer-feedback";
import { ConditionalRawEffect, RawEffect } from "./effects";

export type Answer = {
  id: string;
  effects: RawEffect[];
  conditionalEffects?: ConditionalRawEffect[];
};

export interface ConditionalAnswer {
  if: {
    questionId: string;
    answerId: string;
  }[];
  answer: AnswerFeedback;
}
