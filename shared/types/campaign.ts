import { Answer } from "./answer";
import { AnswerFeedback } from "./answer-feedback";
import { District } from "./district";
import { ConditionalRawEffect, RawEffect } from "./effects";
import { Mandate, PartyVotes } from "./mandate";
import { RawQuestion } from "./question";

export interface CampaignState {
  activeCampaignId: string;
  playerSide?: PlayerSide;
  turn: number;
  currentQuestion?: RawQuestion;
  answerEffects?: Answer[];
  candidateListData?: CandidateListData[];
  partyListData?: PartyListData[];
  results?: CalculateResults;
  isEnded: boolean;
  advisorFeedback?: AnswerFeedback;
  pollingOpnions?: PollingOpnions;
}

export interface PollingOpnions {
  candidateListData: CandidateListData[];
  partyListData?: PartyListData[];
  percentages?: Record<string, number>;
}

export type PlayerSide = {
  partyId: string;
  candidateId?: string;
};

export interface CandidateListData {
  megyekod: number;
  megye: string;
  oevk: number;
  telepules: string;
  valasztopolgar: number;
  partok: Record<string, number | undefined>;
  jeloltek?: Record<string, string[] | undefined>;
}

export interface PartyListData {
  megyekod: number;
  megye: string;
  oevk: number;
  partok: Record<string, number | undefined>;
}

export interface CalculateResults {
  totals: PartyVotes;
  mandates: Mandate[];
  constituencySeats: Record<string, number>;
  listSeats: Record<string, number>;
  compensation: {
    losingVotes: PartyVotes;
    winnerCompensation: PartyVotes;
    total: PartyVotes;
  };
  percentages: Record<string, number>;
}

export interface Decision {
  questionId: string;
  answerId: string;
  effects: RawEffect[];
  conditionalEffects?: ConditionalRawEffect[];
  selectedDistrict?: District | null;
}

export interface TurnResult {
  turn: number;
  candidateListData?: CandidateListData[];
  partyListData?: PartyListData[];
  mandates?: CalculateResults;
}

export interface PendingTurn {
  newGameState: CampaignState;
  decision: Decision;
  rawAnswer: string;
}
