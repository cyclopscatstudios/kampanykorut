import { z } from "zod";
import {
  type GithubClient,
  GithubError,
} from "../../integrations/github/github-client";
import type { IssueOutcome } from "./bug-reports.repository";

export const BUG_LABEL = "bug";
export const FROM_APP_LABEL = "from-app";
export const HAS_CONTACT_LABEL = "has-contact";

const CLOSED_PAGE_SIZE = 100;
const CLOSED_MAX_PAGES = 5;

export interface NewIssue {
  title: string;
  body: string;
  labels: string[];
}

export interface IssueState {
  number: number;
  outcome: IssueOutcome | null;
}

export interface BugReportTracker {
  createIssue(issue: NewIssue): Promise<{ number: number; url: string }>;
  listClosedWithContact(since: Date): Promise<IssueState[]>;
}

const CreatedIssueSchema = z.object({
  number: z.number().int(),
  html_url: z.url(),
});

const ClosedIssuesSchema = z.array(
  z.object({
    number: z.number().int(),
    state: z.string(),
    state_reason: z.string().nullish(),
    pull_request: z.unknown().optional(),
  }),
);

export function closedOutcome(
  stateReason: string | null | undefined,
): IssueOutcome | null {
  if (stateReason === "completed") return "completed";
  if (stateReason === "not_planned" || stateReason === "duplicate") {
    return "not_planned";
  }
  return null;
}

function parse<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new GithubError(
      `Unexpected GitHub response shape:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

export class GithubBugReportTracker implements BugReportTracker {
  constructor(private readonly client: GithubClient) {}

  async createIssue(issue: NewIssue) {
    const created = parse(
      CreatedIssueSchema,
      await this.client.rest("POST", `${this.repoPath}/issues`, issue),
    );
    return { number: created.number, url: created.html_url };
  }

  async listClosedWithContact(since: Date): Promise<IssueState[]> {
    const states: IssueState[] = [];

    for (let page = 1; page <= CLOSED_MAX_PAGES; page++) {
      const query = new URLSearchParams({
        state: "closed",
        labels: HAS_CONTACT_LABEL,
        since: since.toISOString(),
        per_page: String(CLOSED_PAGE_SIZE),
        page: String(page),
      });
      const issues = parse(
        ClosedIssuesSchema,
        await this.client.rest("GET", `${this.repoPath}/issues?${query}`),
      );

      for (const issue of issues) {
        if (issue.pull_request !== undefined) continue;
        states.push({
          number: issue.number,
          outcome: closedOutcome(issue.state_reason),
        });
      }
      if (issues.length < CLOSED_PAGE_SIZE) break;
    }

    return states;
  }

  private get repoPath() {
    const { owner, name } = this.client.repo;
    return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
  }
}
