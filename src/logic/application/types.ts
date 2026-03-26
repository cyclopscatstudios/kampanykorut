import type { DistrictPoligon } from "../../components/ui/map.utils";
import type {
  GameState,
  Decision,
  RawQuestion,
} from "../domain/CampaignEngine";
import type { DistrictGroup } from "../domain/DistrictGroupEngine";
import type {
  RawEffect,
  ConditionalRawEffect,
} from "../domain/EffectApplier.types";
import type { ElectionConfig } from "../domain/MandateCalculator.types";
import type {
  CandidateListData,
  PartyListData,
} from "../domain/ResultTransformer/VoteShareTransformer.types";
import type { VoterEnvironmentConfig } from "../VoterEnvironment";

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
  newGameState: GameState;
  decision: Decision;
  rawAnswer: string;
}

export interface AdvisorFeedbackAssets {
  primaryAdvisorImageUri: string;
  secondaryAdvisorImageUri: string;
}

export interface GameModeConfig {
  electionConfig: ElectionConfig;
  voterEnvironmentConfig: VoterEnvironmentConfig;
  candidateListData: CandidateListData[];
  partyListData: PartyListData[];
  districts: DistrictPoligon[];
  capitalCity: DistrictPoligon[];
  questions: RawQuestion[];
  answerEffect: RawAnsweEffectProps[];
  endResults: EndResultProps;
  advisorFeedback: AdvisorFeedback[];
  advisorFeedbackAssets: AdvisorFeedbackAssets;
  customGroups: DistrictGroup[];
}
