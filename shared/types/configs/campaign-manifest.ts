export interface CandidateManifest {
  questions?: string;
  answerEffect?: string;
  campaignStrategies?: string;
  advisorFeedback?: string;
  advisorFeedbackAssets?: string;
  endResults?: string;
  politicalConfig?: string;
}

export type PlayableSideManifest = Record<string, CandidateManifest>;

export interface CampaignManifestFiles {
  electionConfig: string;
  // Regions of a proportional election, merged into election.regions on load.
  regions?: string;
  // Issues of the electorate, merged into electionConfig.issues on load.
  issues?: string;
  voterEnvironmentConfig: string;
  candidateListData: string;
  partyListData?: string;
  customGroups?: string;
  customPollsters?: string;
  campaignEvents?: string;
  politicalConfig?: string;
  newspaper?: string;
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
