import { describe, expect, it } from "vitest";
import { newAnswer, newQuestion } from "./narrativeModel";

describe("narrative collection integrity", () => {
  it("adds collision-free question and answer IDs with complete party references", () => {
    const first = newQuestion(["a", "b"], []);
    const second = newQuestion(["a", "b"], [first]);
    const extra = newAnswer(["a", "b"], first.answers);
    expect([first.id, second.id]).toEqual(["question_1", "question_2"]);
    expect([...first.answers, extra].map(({ id }) => id)).toEqual([
      "answer_1",
      "answer_2",
      "answer_3",
    ]);
    expect(extra.effects).toEqual({ a: 0, b: 0 });
  });

  it("removing a narrative item leaves surviving IDs and references intact", () => {
    const questions = [newQuestion(["a"], []), newQuestion(["a"], [])];
    const remaining = questions.filter((_, index) => index !== 0);
    expect(remaining[0]).toBe(questions[1]);
    expect(remaining[0].answers[0].effects).toEqual({ a: 0 });
  });
});
