import classNames from "classnames";
import { t } from "i18next";
import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { CampaignConfig, HistoryItem } from "@/shared/types";
import { Button } from "../../../../../../../shared/ui/Button";
import { Text } from "../../../../../../../shared/ui/Text";
import { noop } from "../../../../logic/application/utils";
import { CommonWrapper } from "../../CommonWrapper";
import { Heading } from "../../Heading";
import { AnswerRow } from "../QuestionCard";

interface TurnHistoryProps {
  history: HistoryItem[] | null;
  config: CampaignConfig;
  playerSideId?: string;
  playerCandidateId?: string;
}

export function TurnHistory({
  history,
  config,
  playerSideId,
  playerCandidateId,
}: TurnHistoryProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<
    HistoryItem | undefined
  >(undefined);

  if (!history) {
    return null;
  }

  return (
    <div className="w-full md:h-full flex flex-col md:flex-row gap-4">
      {(isDesktop || !selectedHistoryItem) && (
        <HistorySidebar
          history={history}
          config={config}
          playerSideId={playerSideId}
          playerCandidateId={playerCandidateId}
          selectedHistoryItem={selectedHistoryItem}
          setSelectedHistoryItem={setSelectedHistoryItem}
        />
      )}
      {!isDesktop && selectedHistoryItem && (
        <Button
          variant="tertiary"
          onClick={() => setSelectedHistoryItem(undefined)}
        >
          <Button.Icon name="arrow-left" />
          <Button.Text>{t("endResult.turnHistory.back")}</Button.Text>
        </Button>
      )}
      {selectedHistoryItem && (
        <QuestionCardItem
          item={selectedHistoryItem}
          config={config}
          playerSideId={playerSideId}
          playerCandidateId={playerCandidateId}
        />
      )}
    </div>
  );
}

function HistorySidebar({
  history,
  config,
  playerSideId,
  playerCandidateId,
  selectedHistoryItem,
  setSelectedHistoryItem,
}: TurnHistoryProps & {
  selectedHistoryItem: HistoryItem | undefined;
  setSelectedHistoryItem: (item: HistoryItem | undefined) => void;
}) {
  if (!history) {
    return null;
  }
  return (
    <CommonWrapper className="w-full md:w-auto min-w-0">
      <div className="md:h-[620px] md:overflow-y-auto overflow-x-hidden">
        <div className="border-b border-slate-200/50">
          <div className="p-2">
            <div className="flex justify-between">
              <Text color="gray" weight="bold">
                {t("endResult.turnHistory.label")}
              </Text>
              <Text color="gray">
                {history.length} {t("endResult.turnHistory.turns")}
              </Text>
            </div>
          </div>
        </div>
        {history.map((item, index) => (
          <TurnHistoryItem
            key={item.questionId + item.answerId + index}
            item={item}
            config={config}
            playerSideId={playerSideId}
            playerCandidateId={playerCandidateId}
            selectedHistoryItem={selectedHistoryItem}
            setSelectedHistoryItem={setSelectedHistoryItem}
          />
        ))}
      </div>
    </CommonWrapper>
  );
}

function TurnHistoryItem({
  item,
  config,
  playerSideId,
  playerCandidateId,
  selectedHistoryItem,
  setSelectedHistoryItem,
}: {
  item: HistoryItem;
  config: CampaignConfig;
  playerSideId?: string;
  playerCandidateId?: string;
  selectedHistoryItem: HistoryItem | undefined;
  setSelectedHistoryItem: (item: HistoryItem | undefined) => void;
}) {
  const question = getQuestionById(
    item.questionId,
    config,
    playerSideId,
    playerCandidateId,
  );
  return (
    <button
      type="button"
      className={classNames(
        "w-full md:w-[300px] text-left border-b border-slate-200/50 p-2 cursor-pointer",
        {
          "bg-blue-500/25": selectedHistoryItem?.questionId === item.questionId,
        },
      )}
      onClick={() =>
        setSelectedHistoryItem(
          item.questionId === selectedHistoryItem?.questionId
            ? undefined
            : item,
        )
      }
    >
      <div className="flex items-center gap-4">
        <div>
          <Text size="sm" weight="light" color="gray">
            {t("endResult.turnHistory.historyItem.day")}
          </Text>
          <Text weight="bold" color="gray">
            {item.turn}
          </Text>
        </div>
        <div className="min-w-0">
          <Text
            className="md:max-w-[200px] md:truncate"
            color="gray"
            weight="bold"
          >
            {question?.title ?? question?.question}
          </Text>
        </div>
      </div>
    </button>
  );
}

function getQuestionById(
  questionId: string,
  config: CampaignConfig,
  playerSideId?: string,
  playerCandidateId?: string,
) {
  const questions =
    playerSideId && playerCandidateId
      ? config.playableSides?.[playerSideId]?.[playerCandidateId]?.questions
      : Object.values(config.playableSides ?? {}).flatMap((side) =>
          Object.values(side).flatMap((c) => c.questions),
        );
  return questions?.find((q) => q.id === questionId);
}

function QuestionCardItem({
  item,
  config,
  playerSideId,
  playerCandidateId,
}: {
  item: HistoryItem | null;
  config: CampaignConfig;
  playerSideId?: string;
  playerCandidateId?: string;
}) {
  const question = getQuestionById(
    item?.questionId || "",
    config,
    playerSideId,
    playerCandidateId,
  );

  if (!question) {
    return null;
  }

  return (
    <CommonWrapper className="w-full md:w-auto min-w-0">
      <div className="p-2">
        <Heading level={4} color="lightBlue" className="mb-4">
          {question?.question}
        </Heading>
        {question?.possibleAnswers.map((a, index) => (
          <AnswerRow
            key={a.id}
            answer={a}
            index={index}
            isSelected={a.id === item?.answerId}
            onClick={noop}
          />
        ))}
      </div>
    </CommonWrapper>
  );
}
