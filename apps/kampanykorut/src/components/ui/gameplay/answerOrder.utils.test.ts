import { orderAnswers } from "./answerOrder.utils";

const answers = ["a", "b", "c", "d"].map((id) => ({ id, label: id }));

describe("orderAnswers", () => {
  it("keeps the original order when random is off", () => {
    expect(orderAnswers(answers, "q1", false)).toBe(answers);
    expect(orderAnswers(answers, "q1", undefined)).toBe(answers);
  });

  it("returns the same answers in a stable order for a question", () => {
    const first = orderAnswers(answers, "q1", true, 42);
    expect(orderAnswers(answers, "q1", true, 42)).toEqual(first);
    expect([...first].sort((x, y) => x.id.localeCompare(y.id))).toEqual(
      answers,
    );
    expect(answers.map((a) => a.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("produces different orders across questions", () => {
    const orders = new Set(
      Array.from({ length: 20 }, (_, i) =>
        orderAnswers(answers, `q${i}`, true, 7)
          .map((a) => a.id)
          .join(""),
      ),
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});
