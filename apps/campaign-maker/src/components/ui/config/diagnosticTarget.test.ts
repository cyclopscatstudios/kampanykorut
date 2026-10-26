import { describe, expect, it } from "vitest";
import type { Diagnostic } from "@/shared/validation/campaignValidator";
import { diagnosticTarget } from "./diagnosticTarget";

const diagnostic = (file: string, path: string): Diagnostic => ({
  severity: "error",
  code: "test",
  file,
  path,
  message: "test",
});

describe("Campaign Maker diagnostic targets", () => {
  it.each([
    ["election_config.json", "/title", "basics", "campaign-title"],
    ["election_config.json", "/year", "basics", "campaign-year"],
    ["election_config.json", "/parties/2/name", "parties", "party-2-name"],
    ["election_config.json", "/parties/1/color", "parties", "party-1-color"],
    [
      "election_config.json",
      "/partyListVotes/tisza",
      "parties",
      "party-votes-tisza",
    ],
    [
      "election_config.json",
      "/playableSides/0/label",
      "candidates",
      "side-label",
    ],
    [
      "election_config.json",
      "/playableSides/0/mainCandidates/0/label",
      "candidates",
      "candidate-label",
    ],
    [
      "end_results.json",
      "/deadlock/description",
      "summary",
      "ending-deadlock-description",
    ],
    [
      "questions.json",
      "/0/possibleAnswers/1/label",
      "materials",
      "question-0-answer-1-label",
    ],
    [
      "answer_effects.json",
      "/0/answers/1/effects/0/params/tisza",
      "materials",
      "question-0-answer-1-effect-tisza",
    ],
    [
      "advisor_feedback.json",
      "/0/answers/1/text",
      "materials",
      "question-0-answer-1-feedback",
    ],
  ])("maps %s%s", (file, path, step, id) => {
    expect(diagnosticTarget(diagnostic(file, path))).toEqual({ step, id });
  });

  it("keeps genuinely locked fields unmapped", () => {
    expect(
      diagnosticTarget(diagnostic("election_config.json", "/districtMap")),
    ).toBeNull();
    expect(
      diagnosticTarget(
        diagnostic("election_config.json", "/playableSides/0/id"),
      ),
    ).toBeNull();
    expect(
      diagnosticTarget(diagnostic("election_config.json", "/parties/0/id")),
    ).toBeNull();
  });
});
