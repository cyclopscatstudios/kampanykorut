import classNames from "classnames";
import { t } from "i18next";
import { CurrentView } from "@/shared/types";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import { useAssets } from "../../../hooks/useAssets";
import { CommonWrapper } from "../CommonWrapper";
import { Heading } from "../Heading";
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
    <div className="flex flex-col p-4 bg-slate-900" data-testid={id}>
      <div className="w-full flex flex-col justify-center items-center mb-4 max-h-[500px] overflow-y-auto">
        <div className="w-full mb-4 p-2 border-l-3 border-blue-500">
          {affects && (
            <Tooltip
              content={t("badge.strategicDecision.tooltip")}
              position="right"
            >
              <StrategicDecisionBadge />
            </Tooltip>
          )}
          <Heading level={5} color="lightBlue">
            {question}
          </Heading>
        </div>
        {possibleAnswers.map((a, index) => (
          <AnswerRow
            answer={a}
            index={index}
            key={a.id}
            isSelected={a.id === answer}
            onClick={() => setAnswer(a.id)}
          />
        ))}
      </div>
      <div className="mt-2">
        <div className="flex justify-around mb-4">
          <Button variant="secondary" onClick={() => setCurrentView("MapView")}>
            <Button.Text>{t("questionCard.buttons.mapView")}</Button.Text>
          </Button>
          <div className="bg-slate-700 w-[350px] border border-slate-600 p-3 mb-3">
            <Text
              color="lightBlue"
              weight="bold"
              className="text-center"
              size="sm"
            >
              {cityName}
            </Text>
          </div>
          <Button
            disabled={!answer}
            variant="primary"
            onClick={() => {
              handleOnClick(answer);
            }}
          >
            <Button.Text>{t("questionCard.buttons.continue")}</Button.Text>
          </Button>
        </div>
        <div className="flex items-end justify-center gap-4">
          <div className="h-[150px] border border-slate-600 rounded overflow-hidden">
            <img src={portrait} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-end items-center h-full">
            <div className="h-[150px] w-[350px] border border-slate-600 rounded overflow-hidden">
              <img src={slogan} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="h-[150px] border border-slate-600 rounded overflow-hidden">
            <img src={party_logo} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategicDecisionBadge() {
  return (
    <div className="flex items-center p-1 bg-purple-600/25 border border-purple-300 rounded-full mb-2">
      <Icon name="exclamation-circle-fill" color="purple" className="mx-2" />
      <Text className="text-xs pr-1" color="lightBlue">
        {t("badge.strategicDecision.label")}
      </Text>
    </div>
  );
}

interface QuestionRowProps {
  index: number;
  answer: Answer;
  isSelected: boolean;
  onClick: (answer: string) => void;
}

export function AnswerRow({
  answer,
  index,
  isSelected,
  onClick,
}: QuestionRowProps) {
  const keys = ["A", "B", "C", "D"];
  return (
    <div onClick={() => onClick(answer.label)} className="w-full mb-2">
      <CommonWrapper
        block
        className={classNames("cursor-pointer", {
          "border-blue-500 shadow-lg shadow-blue-500/50": isSelected,
        })}
        customBorder={false}
      >
        <div className="w-full">
          <div className="flex items-center m-4">
            <div
              className={classNames(
                "size-[25px] rounded mr-2 flex shrink-0 items-center justify-center",
                {
                  "bg-blue-500": isSelected,
                  "border border-gray-50/50": !isSelected,
                },
              )}
            >
              <Text weight="bold" color={isSelected ? "white" : "gray"}>
                {keys[index]}
              </Text>
            </div>
            <Text color={isSelected ? "white" : "gray"}>{answer.label}</Text>
          </div>
        </div>
      </CommonWrapper>
    </div>
  );
}
