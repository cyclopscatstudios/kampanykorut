import { test, expect } from "@playwright/experimental-ct-react";
import { QuestionCard } from "../components/ui/gameplay/QuestionCard";

const question = "Who should you align with first?";
const possibleAnswers = [
  { id: "A", label: "Option A" },
  { id: "B", label: "Option B" },
  { id: "C", label: "Option C" },
];

test("renders question and answers", async ({ mount }) => {
  const component = await mount(
    <QuestionCard
      id="q1"
      question={question}
      possibleAnswers={possibleAnswers}
      cityName="Budapest"
      handleOnClick={() => {}}
      setAnswer={() => {}}
      setCurrentView={() => {}}
    />,
  );

  await expect(component).toContainText(question);
  for (const a of possibleAnswers) {
    await expect(component).toContainText(a.label);
  }
});

test("Continue calls handleOnClick with selected answer", async ({ mount }) => {
  let clicked: string | undefined;
  const component = await mount(
    <QuestionCard
      id="q1"
      question={question}
      possibleAnswers={possibleAnswers}
      answer="B"
      cityName="Budapest"
      handleOnClick={(a) => {
        clicked = a;
      }}
      setAnswer={() => {}}
      setCurrentView={() => {}}
    />,
  );

  await component.getByRole("button", { name: "Continue" }).click();
  expect(clicked).toBe("B");
});

test("Map view button calls setCurrentView", async ({ mount }) => {
  let view = "";
  const component = await mount(
    <QuestionCard
      id="q1"
      question={question}
      possibleAnswers={possibleAnswers}
      cityName="Budapest"
      handleOnClick={() => {}}
      setAnswer={() => {}}
      setCurrentView={(v) => {
        view = v;
      }}
    />,
  );

  await component.getByRole("button", { name: "Map view" }).click();
  expect(view).toBe("MapView");
});
