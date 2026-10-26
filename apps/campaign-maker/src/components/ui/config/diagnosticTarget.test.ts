import { createElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Diagnostic } from "@/shared/validation/campaignValidator";
import type { DraftQuestion } from "./CampaignBundleContext";
import { diagnosticTarget } from "./diagnosticTarget";
import { QuestionEditor } from "./steps/NarrativeStep";

const diagnostic = (file: string, path: string): Diagnostic => ({
  severity: "error",
  code: "test",
  file,
  path,
  message: "test",
});

describe("Campaign Maker diagnostic targets", () => {
  afterEach(cleanup);

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
    ["answer_effects.json", "/0/id", "materials", "question-0-id"],
    [
      "answer_effects.json",
      "/0/answers/1/id",
      "materials",
      "question-0-answer-1-id",
    ],
    ["advisor_feedback.json", "/0/questionId", "materials", "question-0-id"],
    [
      "advisor_feedback.json",
      "/0/answers/1/answerId",
      "materials",
      "question-0-answer-1-id",
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
    expect(
      diagnosticTarget(
        diagnostic("answer_effects.json", "/0/answers/1/effects"),
      ),
    ).toBeNull();
    expect(
      diagnosticTarget(
        diagnostic("answer_effects.json", "/0/answers/1/effects/0"),
      ),
    ).toBeNull();
  });

  it("only returns cross-file targets that exist and can receive focus", () => {
    const question: DraftQuestion = {
      id: "question_1",
      title: "Kérdés",
      question: "Mit teszel?",
      answers: [
        {
          id: "answer_1",
          label: "Első válasz",
          feedback: "Első visszajelzés",
          effects: { tisza: 1 },
        },
        {
          id: "answer_2",
          label: "Második válasz",
          feedback: "Második visszajelzés",
          effects: { tisza: -1 },
        },
      ],
    };
    render(
      createElement(QuestionEditor, {
        index: 0,
        question,
        questionIds: [question.id],
        parties: ["tisza"],
        onChange: vi.fn(),
        onRemove: vi.fn(),
      }),
    );

    for (const [file, path] of [
      ["answer_effects.json", "/0/id"],
      ["answer_effects.json", "/0/answers/1/id"],
      ["answer_effects.json", "/0/answers/1/effects/0/params/tisza"],
      ["advisor_feedback.json", "/0/questionId"],
      ["advisor_feedback.json", "/0/answers/1/answerId"],
      ["advisor_feedback.json", "/0/answers/1/text"],
    ]) {
      const target = diagnosticTarget(diagnostic(file, path));
      expect(target).not.toBeNull();
      const control = document.getElementById(target?.id ?? "");
      expect(control).not.toBeNull();
      control?.focus();
      expect(document.activeElement).toBe(control);
    }
  });
});
