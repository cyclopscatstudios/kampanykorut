import type { BugReportRequest, BugReportResponse } from "@/shared/types";

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export const BUG_REPORT_GITHUB_REPO = "cyclopscatstudios/kampanykorut";

export class BugReportApiError extends Error {
  constructor(readonly status: number) {
    super(`Bug report API failed with ${status}`);
    this.name = "BugReportApiError";
  }
}

export async function submitBugReport(
  report: BugReportRequest,
): Promise<BugReportResponse> {
  const res = await fetch(`${API_BASE}/api/v1/bug-reports`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(report),
  });

  if (!res.ok) throw new BugReportApiError(res.status);

  return (await res.json()) as BugReportResponse;
}

export function githubIssueUrl(
  report: Pick<BugReportRequest, "title" | "description" | "steps">,
  environment: BugReportRequest["environment"],
): string {
  const body = [
    "## Description",
    "",
    report.description,
    "",
    "## Steps to Reproduce",
    "",
    report.steps || "-",
    "",
    "## Environment",
    "",
    `- Campaign: ${environment.campaign || "-"}`,
    `- URL: ${environment.url}`,
    `- Browser: ${environment.browser}`,
    `- Version: ${environment.version}`,
  ].join("\n");

  const params = new URLSearchParams({
    title: `[Bug]: ${report.title}`,
    body,
    labels: "bug",
  });

  return `https://github.com/${BUG_REPORT_GITHUB_REPO}/issues/new?${params}`;
}
