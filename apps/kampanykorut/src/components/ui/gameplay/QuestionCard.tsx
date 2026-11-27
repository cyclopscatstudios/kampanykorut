import { Answer as AnswerEffects, CurrentView, RawParty } from "@shared/types";
import { Button } from "@shared/ui/Button";
import { Icon } from "@shared/ui/Icon";
import { Text } from "@shared/ui/Text";
import { Tooltip } from "@shared/ui/Tooltip";
import classNames from "classnames";
import { t } from "i18next";
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMediaQuery } from "usehooks-ts";
import { useCheatSettings } from "../../../debug/cheat/cheatStore";
import { EffectList } from "../../../debug/cheat/EffectList";
import { useAssets } from "../../../hooks/useAssets";
import { CommonWrapper } from "../CommonWrapper";
import { Heading } from "../Heading";
import { orderAnswers } from "./answerOrder.utils";

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
  answerOrderSeed?: string;
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
  answerOrderSeed,
}: Question) {
  const cheat = useCheatSettings();
  const showIds = cheat.enabled && cheat.showIds;
  const showEffects = cheat.enabled && cheat.showEffects;
  const { portrait, slogan, party_logo } = useAssets();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const orderedAnswers = useMemo(
    () => orderAnswers(possibleAnswers, id, answerOrderSeed),
    [possibleAnswers, id, answerOrderSeed],
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const titleId = `${id}-question`;
  const selectedIndex = orderedAnswers.findIndex((a) => a.id === answer);

  const selectAt = (index: number) => {
    const target = orderedAnswers[index];
    if (!target) return;
    setAnswer(target.id);
    const radios =
      groupRef.current?.querySelectorAll<HTMLElement>('[role="radio"]');
    radios?.[index]?.focus();
  };

  const onGroupKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? -1
          : 0;
    if (step) {
      e.preventDefault();
      const from = selectedIndex < 0 ? (step > 0 ? -1 : 0) : selectedIndex;
      selectAt((from + step + orderedAnswers.length) % orderedAnswers.length);
    } else if (e.key === " ") {
      e.preventDefault();
      const index = Number((e.target as HTMLElement).dataset.index);
      if (!Number.isNaN(index)) selectAt(index);
    }
  };

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      if (
        document.querySelector('[aria-modal="true"]:not([aria-hidden="true"])')
      )
        return;
      if (e.key === "Enter") {
        const fromAnswers = groupRef.current?.contains(target);
        if (answer && (fromAnswers || target === document.body)) {
          e.preventDefault();
          handleOnClick(answer);
        }
        return;
      }
      const index = ANSWER_KEYS.findIndex(
        (k, i) => k === e.key.toUpperCase() || String(i + 1) === e.key,
      );
      if (index >= 0 && index < orderedAnswers.length) {
        e.preventDefault();
        selectAt(index);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [id]);

  const [hiddenBelow, setHiddenBelow] = useState(0);
  const measureHidden = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const bottom = container.getBoundingClientRect().bottom - 64;
    const radios =
      groupRef.current?.querySelectorAll<HTMLElement>('[role="radio"]') ?? [];
    setHiddenBelow(
      Array.from(radios).filter((r) => r.getBoundingClientRect().top > bottom)
        .length,
    );
  }, []);

  useEffect(() => {
    measureHidden();
    window.addEventListener("resize", measureHidden);
    return () => window.removeEventListener("resize", measureHidden);
  }, [id, measureHidden]);

  const scrollToHidden = () => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({
      top: container.clientHeight * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="flex flex-col p-3 md:p-4 bg-slate-900 h-full"
      data-testid={id}
    >
      <div className="relative w-full flex-1 min-h-0 flex flex-col mb-4 md:max-h-[500px]">
        <div
          ref={scrollRef}
          onScroll={measureHidden}
          className="w-full flex-1 min-h-0 flex flex-col justify-start items-center overflow-y-auto"
        >
          <div
            data-question-title
            className="w-full mb-4 p-2 border-l-3 border-blue-500"
          >
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
              id={titleId}
              level={5}
              color="lightBlue"
              className="max-md:text-lg max-md:leading-snug"
            >
              {question}
            </Heading>
          </div>
          <div
            ref={groupRef}
            role="radiogroup"
            aria-labelledby={titleId}
            onKeyDown={onGroupKeyDown}
            className="w-full"
          >
            {orderedAnswers.map((a, index) => {
              const row = (
                <AnswerRow
                  answer={a}
                  index={index}
                  key={a.id}
                  isSelected={a.id === answer}
                  isRecommended={a.id === recommendedAnswer}
                  showId={showIds}
                  onClick={setAnswer}
                  focusable={selectedIndex < 0 ? index === 0 : a.id === answer}
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
        </div>
        {hiddenBelow > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-16 items-end justify-center bg-linear-to-t from-slate-900 to-transparent pb-1">
            <button
              type="button"
              onClick={scrollToHidden}
              tabIndex={-1}
              className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-blue-50/10 bg-slate-800 px-3 py-1 text-xs font-bold text-slate-200 cursor-pointer"
            >
              <Icon name="arrow-down" color="currentColor" size="xs" />
              {t("questionCard.moreAnswers", { count: hiddenBelow })}
            </button>
          </div>
        )}
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
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-4">
        <Button
          variant="tertiary"
          onClick={() => setCurrentView("MapView")}
          className="justify-self-start"
        >
          <Button.Icon name="map" />
          <Button.Text>{t("questionCard.buttons.mapView")}</Button.Text>
        </Button>
        <LocationLabel cityName={cityName} />
        <Button
          disabled={!answer}
          variant="primary"
          onClick={() => {
            handleOnClick(answer);
          }}
          className="justify-self-end"
        >
          <Button.Text>{t("questionCard.buttons.continue")}</Button.Text>
        </Button>
      </div>
      <div className="flex items-end justify-center gap-4">
        <div className="h-[150px] border border-slate-600 rounded overflow-hidden">
          <img src={portrait} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="h-[150px] w-[350px] border border-slate-600 rounded overflow-hidden">
          <img src={slogan} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="h-[150px] border border-slate-600 rounded overflow-hidden">
          <img src={party_logo} alt="" className="w-full h-full object-cover" />
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
          <img src={portrait} alt="" className="w-full h-full object-cover" />
        </div>
        <LocationLabel cityName={cityName} className="flex-1" />
        <div className="size-12 shrink-0 border border-slate-600 rounded overflow-hidden">
          <img src={party_logo} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="tertiary"
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

function LocationLabel({
  cityName,
  className,
}: {
  cityName?: string;
  className?: string;
}) {
  if (!cityName) return <div className={className} />;
  return (
    <div
      className={classNames(
        "flex min-w-0 items-center justify-center gap-1.5 text-sm",
        className,
      )}
    >
      <Icon
        name="geo-alt-fill"
        color="currentColor"
        className="shrink-0 text-slate-400"
      />
      <span className="text-slate-400">{t("questionCard.location")}</span>
      <span className="truncate font-bold text-blue-50">{cityName}</span>
    </div>
  );
}

function StrategicDecisionBadge() {
  return (
    <div className="inline-flex items-center gap-2 py-1 pl-2 pr-3 bg-blue-400/10 border border-blue-400/40 rounded-full mb-2">
      <Icon
        name="exclamation-circle-fill"
        color="currentColor"
        className="text-blue-300"
      />
      <Text className="text-xs" color="lightBlue" weight="bold">
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
  onClick?: (answer: string) => void;
  focusable?: boolean;
}

export function AnswerRow({
  answer,
  index,
  isSelected,
  isRecommended,
  showId,
  onClick,
  focusable,
}: QuestionRowProps) {
  const interactive = Boolean(onClick);
  return (
    <div
      onClick={onClick ? () => onClick(answer.id) : undefined}
      role={interactive ? "radio" : undefined}
      aria-checked={interactive ? isSelected : undefined}
      tabIndex={interactive ? (focusable ? 0 : -1) : undefined}
      data-index={index}
      className={classNames(
        "w-full mb-2 rounded-md",
        interactive &&
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue",
      )}
      data-answer
      data-selected={isSelected || undefined}
      data-recommended={isRecommended || undefined}
    >
      <CommonWrapper
        block
        className={classNames({
          "cursor-pointer": interactive,
          "border-blue-300": isSelected,
          "ring-2 ring-emerald-400": isRecommended,
        })}
        customBorder={isSelected}
      >
        <div className="w-full">
          <div className="flex items-center mx-3 my-3 md:m-4">
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
                {ANSWER_KEYS[index]}
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

const ANSWER_KEYS = ["A", "B", "C", "D", "E", "F"];

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
