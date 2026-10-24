import { useState } from "react";
import { QuestionCard } from "./QuestionCard";

export function AnswerSelectionFixture() {
  const [answer, setAnswer] = useState<string>();
  const [submitted, setSubmitted] = useState<string>();
  return (
    <>
      <QuestionCard
        id="keyboard-question"
        question="Melyik választ választod?"
        possibleAnswers={[
          { id: "first", label: "Első válasz" },
          { id: "second", label: "Második válasz" },
        ]}
        answer={answer}
        setAnswer={setAnswer}
        setCurrentView={() => {}}
        handleOnClick={setSubmitted}
      />
      <output>{submitted}</output>
    </>
  );
}
