import { Text } from "../Text";
import { RadioGroup } from "../RadioGroup";
import { useState } from "react";
import { Button } from "../Button";
import type { CurrentView } from "./MainGameScreen";

interface Answer {
  id: string;
  label: string;
  affect?: Record<string, number>[];
}

interface Question {
  id: string;
  question: string;
  possibleAnswers: Answer[];
  setCurrentView: (currentView: CurrentView) => void;
  currentQuestion: number;
  setCurrentQuestion: (currentQuestion: number) => void;
}

export function QuestionCard({
  id,
  question,
  possibleAnswers,
  setCurrentView,
  currentQuestion,
  setCurrentQuestion,
}: Question) {
  const [answer, setAnswer] = useState<string | undefined>();

  return (
    <div className="w-[1024px] h-[768px] border border-blue-500 p-4 bg-blue-50" data-testid={id}>
      <div className="w-full flex flex-col justify-center items-center">
        <div className="bg-blue-900 mb-4 p-2 rounded-md">
          <Text weight="bold" color="light-blue" className="text-center">
            {question}
          </Text>
        </div>
        <RadioGroup
          name="possibleAnswer"
          value={answer}
          onChange={setAnswer}
          options={possibleAnswers.map((q) => ({
            value: q.id,
            label: q.label,
          }))}
          className="hover:text-blue-950 hover:font-bold"
        />
      </div>
      <div className="flex justify-around">
        <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
          <Button.Text>Continue</Button.Text>
        </Button>
        <Button variant="secondary" onClick={() => setCurrentView("MapView")}>
          <Button.Text>Map view</Button.Text>
        </Button>
      </div>
    </div>
  );
}
