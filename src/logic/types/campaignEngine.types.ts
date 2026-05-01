import type { DistrictPoligon } from "../../components/ui/map.utils";
import type {
  District,
  Shares,
  DistrictTarget,
  DistrictTargetGroup,
  CampaignState,
  Decision,
  CandidateListData,
  PartyListData,
  RawQuestion,
} from "../domain";
import type { VoterEnvironmentConfig } from "../domain/VoterEnvironment";

export interface DistrictGroup {
  id: string;
  label: string;
  districts: District[];
}

export type ConditionalRawEffect = {
  if: {
    questionId: string;
    answerId: string;
  }[];
  mode: "merge" | "replace";
  effects: RawEffect[];
};

export enum EffectType {
  UniformSwing = "uniform-swing",
  VoteAllocation = "vote-allocation",
  TurnoutChange = "turnout-change",
  DistrictVoteTransfer = "district-vote-transfer",
}

export type PartyShareParams = {
  newVotes: number;
  share: Record<string, number>;
};

export type AppliedEffect =
  | {
      type: EffectType.UniformSwing;
      baseShare: Shares;
      targetShare: Shares;
    }
  | {
      type: EffectType.VoteAllocation;
      newVotes: number;
      share: Record<string, number>;
    }
  | {
      type: EffectType.DistrictVoteTransfer;
      target: DistrictTarget[];
    }
  | {
      type: EffectType.TurnoutChange;
      motivationDelta: Record<string, number>;
    };

export type RawEffect =
  | {
      type: EffectType.UniformSwing;
      params: Record<string, number>;
    }
  | {
      type: EffectType.VoteAllocation;
      params: PartyShareParams;
    }
  | {
      type: EffectType.DistrictVoteTransfer;
      params: DistrictTarget[] | DistrictTargetGroup[];
    }
  | {
      type: EffectType.TurnoutChange;
      params: Record<string, number>;
    };

export interface Candidates {
  id: string;
  label: string;
  description?: string;
}

export type RawParty = {
  id: string;
  name: string;
  color: string;
};

export interface PlayableSide {
  id: string;
  name: string;
  description?: string;
  mainCandidates: Candidates[];
  playableCandidates?: string[];
}

export interface ElectionAsset {
  portrait: Record<string, string>;
  slogan: Record<string, string>;
  party_logo: string;
}

export type PlayerSide = {
  partyId: string;
  candidateId?: string;
};

export interface ElectionConfig {
  listSeats: number;
  thresholdPercent: number;
  districtBoost?: boolean;
  baseResults?: Record<string, number>;
  parties: RawParty[];
  playableSides: PlayableSide[];
  electionAssets: Record<string, ElectionAsset>;
}

export type Answer = {
  id: string;
  effects: RawEffect[];
  conditionalEffects?: ConditionalRawEffect[];
};

export interface RawAnsweEffectProps {
  id: string;
  answers: Answer[];
}

export interface EndResultProps {
  playerSideDefeat: Asset;
  playerSideVictory: Asset;
}

export interface Asset {
  imageUri: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface AdvisorFeedback {
  questionId: string;
  answers: AnswerFeedback[];
  conditionalAnswers?: ConditionalAnswer[];
}

export interface ConditionalAnswer {
  if: {
    questionId: string;
    answerId: string;
  }[];
  answer: AnswerFeedback;
}

export interface AnswerFeedback {
  answerId: string;
  text: string;
}

export interface PendingTurn {
  newGameState: CampaignState;
  decision: Decision;
  rawAnswer: string;
}

export interface AdvisorFeedbackAssets {
  primaryAdvisorImageUri: string;
  secondaryAdvisorImageUri: string;
}

export interface CampaignConfig {
  electionConfig: ElectionConfig;
  voterEnvironmentConfig: VoterEnvironmentConfig;
  candidateListData: CandidateListData[];
  partyListData: PartyListData[];
  districts: DistrictPoligon[];
  capitalCity: DistrictPoligon[];
  questions: RawQuestion[];
  answerEffect: RawAnsweEffectProps[];
  endResults: EndResultProps;
  advisorFeedback?: AdvisorFeedback[];
  advisorFeedbackAssets?: AdvisorFeedbackAssets;
  customGroups?: DistrictGroup[];
}
