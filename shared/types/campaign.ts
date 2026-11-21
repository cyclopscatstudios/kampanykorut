import { Answer } from "./answer";
import { AnswerFeedback } from "./answer-feedback";
import { District } from "./district";
import { ConditionalRawEffect, RawEffect } from "./effects";
import { IssuePositions } from "./issue";
import { Mandate, PartyVotes } from "./mandate";
import { MayoralResult } from "./mayoral-result";
import { NewspaperState } from "./newspaper";
import { CoalitionState, PoliticalDashboardState } from "./political";
import { RawQuestion } from "./question";

export interface CampaignState {
  activeCampaignId: string;
  playerSide?: PlayerSide;
  turn: number;
  currentQuestion?: RawQuestion;
  answerEffects?: Answer[];
  candidateListData?: CandidateListData[];
  partyListData?: PartyListData[];
  partyListVotes?: PartyListVotes;
  results?: CalculateResults;
  mayoralResult?: MayoralResult;
  candidates?: Record<string, CandidateCampaignState>;
  // Party positions on issues that moved away from the configured ones.
  issuePositions?: IssuePositions;
  campaignEvents?: CampaignEventState;
  politicalDashboard?: PoliticalDashboardState;
  coalition?: CoalitionState;
  newspaper?: NewspaperState;
  introSeen?: boolean;
  campaignConfigVersion?: string;
  questionCursor?: number;
  decisionCount?: number;
  isEnded: boolean;
  advisorFeedback?: AnswerFeedback;
  pollingOpnions?: PollingOpnions;
  campaignView?: CampaignView;
  isBaseResultsAlreadyApplied: boolean;
}

// "dormant": a party that only enters the race through a split-party event.
export type CandidateStatus = "active" | "inactive" | "dormant";

export type CandidateInactiveReason =
  | "withdrawal"
  | "disqualification"
  | "other";

export interface CandidateCampaignState {
  status: CandidateStatus;
  inactiveReason?: CandidateInactiveReason;
  endorsedCandidateId?: string;
  splitFromIds?: string[];
  changedAtTurn?: number;
}

export interface CampaignEventState {
  triggeredEventIds: string[];
  pendingAnnouncementIds: string[];
  triggeredAtTurn?: Record<string, number>;
}

export type CurrentView = "MapView" | "QuestionView" | "VoteCountingView";

export interface CampaignView {
  type: CurrentView;
  district?: Pick<CandidateListData, "megyekod" | "oevk">;
}

export interface PollingOpnions {
  candidateListData?: CandidateListData[];
  partyListData?: PartyListData[];
  percentages?: PartyResults;
  selectedPollsterId?: string;
  polls?: Record<string, number>;
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

export type PartyListVotes = Record<string, number>;

export interface CalculateResults {
  totals: PartyResults;
  mandates: Mandate[];
  constituencySeats: Record<string, number>;
  listSeats: Record<string, number>;
  compensation: {
    losingVotes: PartyVotes;
    winnerCompensation: PartyVotes;
    total: PartyVotes;
  };
  percentages: PartyResults;
  regions?: RegionSeatResult[];
}

export interface RegionSeatResult {
  id: string;
  name: string;
  seats: number;
  votes: PartyVotes;
  allocation: Record<string, number>;
}

export interface PartyResults {
  candidateListResults: Record<string, number>;
  partyListResults: Record<string, number>;
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
