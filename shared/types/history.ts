import { CalculateResults, CandidateListData } from "./campaign";

export interface HistoryItem {
  questionId: string;
  answerId: string;
  visitedDistrict: Pick<CandidateListData, "oevk" | "megyekod">;
  turn: number;
  results: CalculateResults;
}
