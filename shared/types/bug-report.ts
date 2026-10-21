export interface BugReportEnvironment {
  campaign: string;
  url: string;
  browser: string;
  version: string;
}

export interface BugReportRequest {
  title: string;
  description: string;
  steps: string;
  email?: string;
  environment: BugReportEnvironment;
  turnstileToken?: string;
  website?: string;
}

export interface BugReportResponse {
  id: string;
  issueNumber: number | null;
}
