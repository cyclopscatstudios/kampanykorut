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
    <div
      className="h-full border flex flex-col border-blue-500 p-4 bg-blue-50"
      data-testid={id}
    >
      <div className="w-full flex flex-col justify-center items-center mb-4">
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
      <div className="flex justify-around items-center bg-blue-900 h-[350px] w-full mt-auto">
        <div className="w-[200px] h-[300px] bg-white">
          {/*           <img src="https://upload.wikimedia.org/wikipedia/commons/b/b6/M%C3%A1rki-Zay_P%C3%A9ter_cropped.jpg" />
           */}{" "}
        </div>
        <div className="w-[200px] h-[300px] bg-white">
          {/*           <img src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Egys%C3%A9gben_Magyarorsz%C3%A1g%C3%A9rt_2022.png" />
           */}{" "}
        </div>
        <div className="w-[200px] h-[300px] bg-white">
          {/*           <img src="https://s3-eu-central-1.amazonaws.com/greenfo.hu/wp-media-folder-greenfo/wp-content/uploads/2021/05/hatparti-logok.jpg" />
           */}{" "}
        </div>
      </div>
    </div>
  );
}
