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
  partyListData?: string;
  customGroups?: string;
  customPollsters?: string;
  campaignEvents?: string;
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
  listing?: CampaignListing;
  files: CampaignManifestFiles;
}

export type CampaignStatus = "draft" | "candidate" | "published";

export interface CampaignListing {
  id: string;
  label: string;
  description: string;
  year: number;
  tags: string[];
  campaignBanner: string;
  thinCampaignBanner?: string;
  status: CampaignStatus;
}
