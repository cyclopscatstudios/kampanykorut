import { Condition } from "./condition";
import type { GameMode } from "./political";

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
  gameModes?: GameMode[];
}
