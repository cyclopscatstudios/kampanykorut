import { Text } from "../Text";
import { RadioGroup } from "../RadioGroup";
import { useState } from "react";
import { Button } from "../Button";
import type { CurrentView } from "./MainGameScreen";
import mzpPortrait from "../../../assets/images/2022/mzp-portrait.png";
import ellenzekiOsszefogas from "../../../assets/images/2022/ellenzeki-osszefogas.png";
import { ImageWrapper } from "./ImageWrapper";
import slogan from "../../../assets/images/2022/ellenzeki_osszefogas_2022_kampany_szoveg.png";

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
          <Text weight="bold" color="lightBlue" className="text-center">
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
      <div className="mt-auto mb-5">
        <div className="flex justify-around">
          <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
            <Button.Text>Continue</Button.Text>
          </Button>
          <Button variant="secondary" onClick={() => setCurrentView("MapView")}>
            <Button.Text>Map view</Button.Text>
          </Button>
        </div>
        <div className="h-[280px] flex items-end justify-center bg-gray-100 mb-2">
          <ImageWrapper src={mzpPortrait} type="portrait" />
          <div className="flex flex-col justify-end items-center h-full m-10">
            <div className="bg-blue-900 w-[300px] m-3 p-2">
              <Text color="lightBlue" weight="bold" className="text-center">
                Nyíregyháza
              </Text>
            </div>
            <ImageWrapper src={slogan} type="slogan" />
          </div>
          <ImageWrapper src={ellenzekiOsszefogas} type="portrait" />
        </div>
      </div>
    </div>
  );
}
