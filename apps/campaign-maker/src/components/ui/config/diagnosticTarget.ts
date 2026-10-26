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
  const answer = numbers[1];
  if (answer !== undefined) {
    const effectParty = path.match(/\/params\/([^/]+)$/)?.[1];
    const field = item.file.includes("answer_effects")
      ? `effect-${effectParty ?? "value"}`
      : item.file.includes("advisor_feedback")
        ? "feedback"
        : path.includes("/id")
          ? "id"
          : "label";
    return {
      step: "materials",
      id: `question-${question}-answer-${answer}-${field}`,
    };
  }
  const field = path.includes("/id")
    ? "id"
    : path.includes("title")
      ? "title"
      : "question";
  return { step: "materials", id: `question-${question}-${field}` };
}
