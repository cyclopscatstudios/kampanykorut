export interface CandidateManifest {
  questions?: string;
  answerEffect?: string;
  campaignStrategies?: string;
  advisorFeedback?: string;
  advisorFeedbackAssets?: string;
  endResults?: string;
}

export type PlayableSideManifest = Record<string, CandidateManifest>;

export interface CampaignManifest {
  electionConfig: string;
  voterEnvironmentConfig: string;
  candidateListData: string;
  districts: string;
  partyListData?: string;
  customGroups?: string;
  customPollsters?: string;
  playableSides?: Record<string, PlayableSideManifest>;
}
