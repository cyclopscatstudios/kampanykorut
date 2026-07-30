import { AdvisorFeedback, AdvisorFeedbackAssets } from "../answer-feedback";
import { CandidateListData, PartyListData } from "../campaign";
import { DistrictGroup } from "../district";
import { RawAnsweEffectProps } from "../effects";
import { EndResultProps } from "../end-result";
import { DistrictPoligon } from "../map";
import { Pollster } from "../pollsters";
import { RawQuestion } from "../question";
import { Strategy } from "../strategy";
import { ElectionConfig } from "./election-config";
import { VoterEnvironmentConfig } from "./voter-environment-config";

export interface CandidateConfig {
  questions: RawQuestion[];
  answerEffect: RawAnsweEffectProps[];
  campaignStrategies?: Strategy[];
  advisorFeedback?: AdvisorFeedback[];
  advisorFeedbackAssets?: AdvisorFeedbackAssets;
  endResults?: EndResultProps;
}

export type PlayableSideConfig = Record<string, CandidateConfig>;

export interface CampaignConfig {
  electionConfig: ElectionConfig;
  voterEnvironmentConfig: VoterEnvironmentConfig;
  candidateListData: CandidateListData[];
  partyListData?: PartyListData[];
  districts: DistrictPoligon[];
  customGroups?: DistrictGroup[];
  customPollsters?: Pollster[];
  playableSides?: Record<string, PlayableSideConfig>;
}
