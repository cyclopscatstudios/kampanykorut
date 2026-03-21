import { Text } from "../Text";
import { RadioGroup } from "../RadioGroup";
import { Button } from "../Button";
import type { CurrentView } from "./MainGameScreen";
import mzpPortrait from "../../../assets/images/2022/mzp-portrait.png";
import ellenzekiOsszefogas from "../../../assets/images/2022/ellenzeki-osszefogas.png";
import { ImageWrapper } from "./ImageWrapper";
import slogan from "../../../assets/images/2022/ellenzeki_osszefogas_2022_kampany_szoveg.png";
import { Icon } from "../Icon";
import { Tooltip } from "../Tooltip";

interface Answer {
  id: string;
  label: string;
  affect?: Record<string, number>[];
}

export interface Question {
  id: string;
  question: string;
  possibleAnswers: Answer[];
  answer?: string;
  affects?: { id: string }[];
  setAnswer: (a: string) => void;
  setCurrentView: (currentView: CurrentView) => void;
  handleOnClick: (answer?: string) => void;
}

export function QuestionCard({
  id,
  question,
  possibleAnswers,
  answer,
  affects,
  setAnswer,
  setCurrentView,
  handleOnClick,
}: Question) {
  return (
    <div
      className="h-full border flex flex-col border-blue-500 p-4 bg-blue-50"
      data-testid={id}
    >
      <div className="w-full flex flex-col justify-center items-center mb-4">
        <div className="flex justify-center items-center bg-blue-900 mb-4 p-2 rounded-md">
          <Text weight="bold" color="lightBlue" className="text-center">
            {question}
          </Text>
          {affects && (
            <Tooltip
              content="Your choice may influence how future questions unfold."
              position="right"
            >
              <Icon
                name="exclamation-circle-fill"
                color="purple"
                className="mx-2"
              />
            </Tooltip>
          )}
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
          <Button
            onClick={() => {
              handleOnClick(answer);
            }}
          >
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
