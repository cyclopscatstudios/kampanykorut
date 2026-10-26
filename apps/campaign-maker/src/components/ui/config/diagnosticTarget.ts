import type { Diagnostic } from "@/shared/validation/campaignValidator";

export interface DiagnosticTarget {
  step: "basics" | "parties" | "candidates" | "materials" | "summary";
  id: string;
}

export function diagnosticTarget(item: Diagnostic): DiagnosticTarget | null {
  const { path } = item;
  if (item.file.endsWith("election_config.json")) {
    if (path === "/title") return { step: "basics", id: "campaign-title" };
    if (path === "/year") return { step: "basics", id: "campaign-year" };
    const partyIndex = path.match(/^\/parties\/(\d+)/)?.[1];
    if (partyIndex !== undefined) {
      if (path.endsWith("/id")) return null;
      const field = path.endsWith("/color") ? "color" : "name";
      return { step: "parties", id: `party-${partyIndex}-${field}` };
    }
    const voteParty = path.match(/^\/partyListVotes\/(.+)$/)?.[1];
    if (voteParty) return { step: "parties", id: `party-votes-${voteParty}` };
    if (path.startsWith("/playableSides/0/mainCandidates/0/")) {
      if (!path.endsWith("/label") && !path.endsWith("/description"))
        return null;
      return {
        step: "candidates",
        id: path.endsWith("/description")
          ? "candidate-description"
          : "candidate-label",
      };
    }
    if (path.startsWith("/playableSides/0/")) {
      if (!path.endsWith("/label") && !path.endsWith("/description"))
        return null;
      return {
        step: "candidates",
        id: path.endsWith("/description") ? "side-description" : "side-label",
      };
    }
    return null;
  }
  if (item.file.includes("end_results")) {
    const match = path.match(
      /^\/(playerSideVictory|playerSideDefeat|deadlock)\/(title|subtitle|description)/,
    );
    return match
      ? { step: "summary", id: `ending-${match[1]}-${match[2]}` }
      : null;
  }
  if (
    !item.file.includes("questions") &&
    !item.file.includes("answer_effects") &&
    !item.file.includes("advisor_feedback")
  )
    return null;
  const numbers = path.match(/\d+/g)?.map(Number) ?? [];
  const question = numbers[0];
  if (question === undefined) return null;
  if (item.file.includes("answer_effects")) {
    if (path === `/${question}/id`)
      return { step: "materials", id: `question-${question}-id` };
    const answer = path.match(/^\/\d+\/answers\/(\d+)/)?.[1];
    if (answer === undefined) return null;
    if (path === `/${question}/answers/${answer}/id`)
      return {
        step: "materials",
        id: `question-${question}-answer-${answer}-id`,
      };
    const effectParty = path.match(/\/params\/([^/]+)$/)?.[1];
    if (!effectParty) return null;
    return {
      step: "materials",
      id: `question-${question}-answer-${answer}-effect-${effectParty}`,
    };
  }
  if (item.file.includes("advisor_feedback")) {
    if (path === `/${question}/questionId`)
      return { step: "materials", id: `question-${question}-id` };
    const answer = path.match(/^\/\d+\/answers\/(\d+)/)?.[1];
    if (answer === undefined) return null;
    if (path === `/${question}/answers/${answer}/answerId`)
      return {
        step: "materials",
        id: `question-${question}-answer-${answer}-id`,
      };
    if (path === `/${question}/answers/${answer}/text`)
      return {
        step: "materials",
        id: `question-${question}-answer-${answer}-feedback`,
      };
    return null;
  }
  const answer = path.match(/^\/\d+\/possibleAnswers\/(\d+)/)?.[1];
  if (answer !== undefined && (path.endsWith("/id") || path.endsWith("/label")))
    return {
      step: "materials",
      id: `question-${question}-answer-${answer}-${path.endsWith("/id") ? "id" : "label"}`,
    };
  if (path === `/${question}/id`)
    return { step: "materials", id: `question-${question}-id` };
  if (path === `/${question}/title`)
    return { step: "materials", id: `question-${question}-title` };
  if (path === `/${question}/question`)
    return { step: "materials", id: `question-${question}-question` };
  return null;
}
