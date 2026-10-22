import { describe, expect, it, vi } from "vitest";
import type { GithubClient } from "../../integrations/github/github-client";
import { closedOutcome, GithubBugReportTracker } from "./bug-reports.github";

function fakeClient(rest: (method: string, path: string) => Promise<unknown>) {
  return {
    repo: { owner: "cyclopscatstudios", name: "kampanykorut" },
    rest: vi.fn(rest),
  } as unknown as GithubClient & { rest: ReturnType<typeof vi.fn> };
}

describe("closedOutcome", () => {
  it("maps GitHub state reasons", () => {
    expect(closedOutcome("completed")).toBe("completed");
    expect(closedOutcome("not_planned")).toBe("not_planned");
    expect(closedOutcome("duplicate")).toBe("not_planned");
    expect(closedOutcome(null)).toBeNull();
  });
});

describe("GithubBugReportTracker", () => {
  it("creates an issue in the configured repository", async () => {
    const client = fakeClient(async () => ({
      number: 12,
      html_url: "https://github.com/cyclopscatstudios/kampanykorut/issues/12",
    }));
    const tracker = new GithubBugReportTracker(client);

    const issue = { title: "[Bug]: x", body: "y", labels: ["bug"] };

    await expect(tracker.createIssue(issue)).resolves.toEqual({
      number: 12,
      url: "https://github.com/cyclopscatstudios/kampanykorut/issues/12",
    });
    expect(client.rest).toHaveBeenCalledWith(
      "POST",
      "/repos/cyclopscatstudios/kampanykorut/issues",
      issue,
    );
  });

  it("lists recently closed issues with contact, skipping pull requests", async () => {
    const page = (start: number, count: number) =>
      Array.from({ length: count }, (_, i) => ({
        number: start + i,
        state: "closed",
        state_reason: i % 2 ? "not_planned" : "completed",
      }));
    const client = fakeClient(async (_method, path) =>
      new URLSearchParams(path.split("?")[1]).get("page") === "1"
        ? [...page(1, 99), { number: 500, state: "closed", pull_request: {} }]
        : page(200, 2),
    );
    const tracker = new GithubBugReportTracker(client);

    const issues = await tracker.listClosedWithContact(
      new Date("2026-10-17T10:00:00Z"),
    );

    expect(issues).toHaveLength(101);
    expect(issues[0]).toEqual({ number: 1, outcome: "completed" });
    expect(issues[1]).toEqual({ number: 2, outcome: "not_planned" });
    expect(issues.some((issue) => issue.number === 500)).toBe(false);
    const firstPath = client.rest.mock.calls[0]![1] as string;
    expect(firstPath).toMatch(
      /^\/repos\/cyclopscatstudios\/kampanykorut\/issues\?/,
    );
    expect(new URLSearchParams(firstPath.split("?")[1])).toEqual(
      new URLSearchParams({
        state: "closed",
        labels: "has-contact",
        since: "2026-10-17T10:00:00.000Z",
        per_page: "100",
        page: "1",
      }),
    );
    expect(client.rest).toHaveBeenCalledTimes(2);
  });

  it("rejects unexpected response shapes", async () => {
    const tracker = new GithubBugReportTracker(fakeClient(async () => ({})));

    await expect(
      tracker.createIssue({ title: "x", body: "y", labels: [] }),
    ).rejects.toThrow(/Unexpected GitHub response shape/);
  });
});
