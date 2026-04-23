import { Text } from "../Text";
import { RadioGroup } from "../RadioGroup";
import { Button } from "../Button";
import type { CurrentView } from "./MainGameScreen";
import { Icon } from "../Icon";
import { Tooltip } from "../Tooltip";
import { Heading } from "../Heading";
import { useAssets } from "../../../hooks/useAssets";

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
  cityName?: string;
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
  cityName,
}: Question) {
  const { portrait, slogan, party_logo } = useAssets();
  return (
    <div className="h-[784px] flex flex-col p-4 bg-slate-900" data-testid={id}>
      <div className="w-full flex flex-col justify-center items-center mb-4">
        <div className="bg-slate-700 mb-4 p-2 rounded">
          {affects && (
            <Tooltip
              content="Your choice may influence how future questions unfold."
              position="bottom"
            >
              <div className="flex items-center p-1 bg-slate-600 rounded-full mb-2">
                <Icon
                  name="exclamation-circle-fill"
                  color="purple"
                  className="mx-2"
                />
                <Text className="text-xs pr-1" color="lightBlue">
                  Strategic decision
                </Text>
              </div>
            </Tooltip>
          )}
          <Heading level={4} color="lightBlue">
            {question}
          </Heading>
        </div>
        <RadioGroup
          name="possibleAnswer"
          value={answer}
          onChange={setAnswer}
          options={possibleAnswers.map((q) => ({
            value: q.id,
            label: q.label,
          }))}
        />
      </div>
      <div className="mt-2">
        <div className="flex justify-around mb-4">
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
        <div className="flex items-end justify-center gap-4">
          <div className="h-[220px] border border-slate-600 rounded overflow-hidden">
            <img src={portrait} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-end items-center h-full">
            <div className="bg-slate-700 w-[350px] border border-slate-600 p-3 mb-5">
              <Text color="lightBlue" weight="bold" className="text-center">
                {cityName}
              </Text>
            </div>
            <div className="h-[150px] w-[350px] border border-slate-600 rounded overflow-hidden">
              <img src={slogan} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="h-[220px] border border-slate-600 rounded overflow-hidden">
            <img src={party_logo} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
