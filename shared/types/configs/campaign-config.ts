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

export interface CampaignConfig {
  electionConfig: ElectionConfig;
  voterEnvironmentConfig: VoterEnvironmentConfig;
  candidateListData: CandidateListData[];
  partyListData?: PartyListData[];
  districts: DistrictPoligon[];
  questions: RawQuestion[];
  answerEffect: RawAnsweEffectProps[];
  endResults: EndResultProps;
  advisorFeedback?: AdvisorFeedback[];
  advisorFeedbackAssets?: AdvisorFeedbackAssets;
  customGroups?: DistrictGroup[];
  customPollsters?: Pollster[];
  campaignStrategies?: Strategy[];
}
