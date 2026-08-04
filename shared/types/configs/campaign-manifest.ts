export interface CandidateManifest {
  questions?: string;
  answerEffect?: string;
  campaignStrategies?: string;
  advisorFeedback?: string;
  advisorFeedbackAssets?: string;
  endResults?: string;
}

export type PlayableSideManifest = Record<string, CandidateManifest>;

export interface CampaignManifestFiles {
  electionConfig: string;
  voterEnvironmentConfig: string;
  candidateListData: string;
  districts: string;
  partyListData?: string;
  customGroups?: string;
  customPollsters?: string;
  playableSides?: Record<string, PlayableSideManifest>;
}

export interface CampaignManifestMetadata {
  version: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignManifest {
  schemaVersion: number;
  metadata?: CampaignManifestMetadata;
  files: CampaignManifestFiles;
}
