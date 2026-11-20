import { orderAnswers } from "./answerOrder.utils";

const answers = ["a", "b", "c", "d"].map((id) => ({ id, label: id }));

describe("orderAnswers", () => {
  it("keeps the original order without a seed", () => {
    expect(orderAnswers(answers, "q1", undefined)).toBe(answers);
  });

  it("returns the same answers in a stable order for a question", () => {
    const first = orderAnswers(answers, "q1", "session-a");
    expect(orderAnswers(answers, "q1", "session-a")).toEqual(first);
    expect([...first].sort((x, y) => x.id.localeCompare(y.id))).toEqual(
      answers,
    );
    expect(answers.map((a) => a.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("produces different orders across questions", () => {
    const orders = new Set(
      Array.from({ length: 20 }, (_, i) =>
        orderAnswers(answers, `q${i}`, "session-a")
          .map((a) => a.id)
          .join(""),
      ),
    );
    expect(orders.size).toBeGreaterThan(1);
  });

  it("produces different orders across sessions", () => {
    const orders = new Set(
      Array.from({ length: 20 }, (_, i) =>
        orderAnswers(answers, "q1", `session-${i}`)
          .map((a) => a.id)
          .join(""),
      ),
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});
