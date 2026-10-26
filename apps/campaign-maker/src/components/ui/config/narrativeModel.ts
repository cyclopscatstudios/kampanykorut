import type { DraftAnswer, DraftQuestion } from "./CampaignBundleContext";

export function nextId(prefix: string, used: string[]): string {
  let suffix = used.length + 1;
  while (used.includes(`${prefix}_${suffix}`)) suffix += 1;
  return `${prefix}_${suffix}`;
}

export function newAnswer(
  parties: string[],
  answers: DraftAnswer[],
): DraftAnswer {
  return {
    id: nextId(
      "answer",
      answers.map(({ id }) => id),
    ),
    label: "",
    feedback: "",
    effects: Object.fromEntries(parties.map((party) => [party, 0])),
  };
}

export function newQuestion(
  parties: string[],
  questions: DraftQuestion[],
): DraftQuestion {
  const id = nextId(
    "question",
    questions.map((question) => question.id),
  );
  const answers: DraftAnswer[] = [];
  answers.push(newAnswer(parties, answers));
  answers.push(newAnswer(parties, answers));
  return { id, title: "Új kérdés", question: "", answers };
}
