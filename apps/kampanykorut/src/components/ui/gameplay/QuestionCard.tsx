import classNames from "classnames";
import { t } from "i18next";
import { useLayoutEffect, useRef } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Answer as AnswerEffects, CurrentView, RawParty } from "@/shared/types";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import { Tooltip } from "../../../../../../shared/ui/Tooltip";
import { useCheatSettings } from "../../../debug/cheat/cheatStore";
import { EffectList } from "../../../debug/cheat/EffectList";
import { useAssets } from "../../../hooks/useAssets";
import { CommonWrapper } from "../CommonWrapper";
import { Heading } from "../Heading";

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
  answerEffects?: AnswerEffects[];
  parties?: Pick<RawParty, "id" | "name">[];
  recommendedAnswer?: string;
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
  answerEffects,
  parties = [],
  recommendedAnswer,
  setAnswer,
  setCurrentView,
  handleOnClick,
  cityName,
}: Question) {
  const cheat = useCheatSettings();
  const showIds = cheat.enabled && cheat.showIds;
  const showEffects = cheat.enabled && cheat.showEffects;
  const { portrait, slogan, party_logo } = useAssets();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [id]);

  return (
    <div
      className="flex flex-col p-3 md:p-4 bg-slate-900 h-full"
      data-testid={id}
    >
      <div
        ref={scrollRef}
        className="w-full flex-1 min-h-0 flex flex-col justify-start items-center mb-4 md:max-h-[500px] overflow-y-auto"
      >
        <div className="w-full mb-4 p-2 border-l-3 border-blue-500">
          {affects && (
            <Tooltip
              content={t("badge.strategicDecision.tooltip")}
              position="right"
            >
              <StrategicDecisionBadge />
            </Tooltip>
          )}
          {showIds && <CheatId value={id} className="mb-1" />}
          <Heading
            level={5}
            color="lightBlue"
            className="max-md:text-lg max-md:leading-snug"
          >
            {question}
          </Heading>
        </div>
        {possibleAnswers.map((a, index) => {
          const row = (
            <AnswerRow
              answer={a}
              index={index}
              key={a.id}
              isSelected={a.id === answer}
              isRecommended={a.id === recommendedAnswer}
              showId={showIds}
              onClick={setAnswer}
            />
          );
          const effects = answerEffects?.find((e) => e.id === a.id);
          return showEffects && effects ? (
            <Tooltip
              key={a.id}
              block
              position={isDesktop ? "right" : "top"}
              content={<EffectList answer={effects} parties={parties} />}
            >
              {row}
            </Tooltip>
          ) : (
            row
          );
        })}
      </div>
      <div className="mt-2 shrink-0">
        {isDesktop ? (
          <WideActions
            cityName={cityName}
            answer={answer}
            setCurrentView={setCurrentView}
            handleOnClick={handleOnClick}
            portrait={portrait}
            slogan={slogan}
            party_logo={party_logo}
          />
        ) : (
          <NarrowActions
            cityName={cityName}
            answer={answer}
            setCurrentView={setCurrentView}
            handleOnClick={handleOnClick}
            portrait={portrait}
            slogan={slogan}
            party_logo={party_logo}
          />
        )}
      </div>
    </div>
  );
}

interface QuestionCardActionsProps {
  cityName?: string;
  answer?: string;
  setCurrentView: (currentView: CurrentView) => void;
  handleOnClick: (answer?: string) => void;
  portrait: string;
  slogan: string;
  party_logo: string;
}

function WideActions({
  cityName,
  answer,
  setCurrentView,
  handleOnClick,
  portrait,
  slogan,
  party_logo,
}: QuestionCardActionsProps) {
  return (
    <>
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
    </>
  );
}

function NarrowActions({
  cityName,
  answer,
  setCurrentView,
  handleOnClick,
  portrait,
  party_logo,
}: QuestionCardActionsProps) {
  return (
    <div className="shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="size-12 shrink-0 border border-slate-600 rounded overflow-hidden">
          <img src={portrait} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 bg-slate-700 border border-slate-600 p-2">
          <Text
            color="lightBlue"
            weight="bold"
            className="text-center"
            size="sm"
          >
            {cityName}
          </Text>
        </div>
        <div className="size-12 shrink-0 border border-slate-600 rounded overflow-hidden">
          <img src={party_logo} className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => setCurrentView("MapView")}
          className="shrink-0"
        >
          <Button.Icon name="map" />
          <Button.Text>{t("questionCard.buttons.mapView")}</Button.Text>
        </Button>
        <Button
          block
          disabled={!answer}
          variant="primary"
          onClick={() => {
            handleOnClick(answer);
          }}
          className="flex-1"
        >
          <Button.Text>{t("questionCard.buttons.continue")}</Button.Text>
          <Button.Icon name="arrow-right" />
        </Button>
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
  isRecommended?: boolean;
  showId?: boolean;
  onClick: (answer: string) => void;
}

export function AnswerRow({
  answer,
  index,
  isSelected,
  isRecommended,
  showId,
  onClick,
}: QuestionRowProps) {
  const keys = ["A", "B", "C", "D"];
  return (
    <div
      onClick={() => onClick(answer.id)}
      className="w-full mb-2"
      data-recommended={isRecommended || undefined}
    >
      <CommonWrapper
        block
        className={classNames("cursor-pointer", {
          "border-blue-500 shadow-lg shadow-blue-500/50": isSelected,
          "ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/40":
            isRecommended,
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
            <Text color={isSelected ? "white" : "gray"} className="flex-1">
              {answer.label}
            </Text>
            {showId && <CheatId value={answer.id} />}
            {isRecommended && (
              <Icon
                name="check-circle-fill"
                color="currentColor"
                className="ml-2 shrink-0 text-emerald-400"
              />
            )}
          </div>
        </div>
      </CommonWrapper>
    </div>
  );
}

function CheatId({
  value,
  className = "ml-2",
}: {
  value: string;
  className?: string;
}) {
  return (
    <span
      className={classNames(
        className,
        "inline-block shrink-0 rounded bg-amber-400/15 px-1.5 py-0.5 font-mono text-[11px] text-amber-200",
      )}
    >
      {value}
    </span>
  );
}
