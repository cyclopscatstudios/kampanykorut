import classNames from "classnames";
import { t } from "i18next";
import { useState } from "react";
import { type HistoryItem } from "@/logic/application";
import { CampaignConfig } from "@/shared/types";
import { noop } from "../../../../logic/application/utils";
import { CommonWrapper } from "../../CommonWrapper";
import { Heading } from "../../Heading";
import { Text } from "../../Text";
import { AnswerRow } from "../QuestionCard";

interface TurnHistoryProps {
  history: HistoryItem[] | null;
  config: CampaignConfig;
}

export function TurnHistory({ history, config }: TurnHistoryProps) {
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<
    HistoryItem | undefined
  >(undefined);

  if (!history) {
    return null;
  }

  return (
    <div className="size-full flex gap-4">
      <HistorySidebar
        history={history}
        config={config}
        selectedHistoryItem={selectedHistoryItem}
        setSelectedHistoryItem={setSelectedHistoryItem}
      />
      {selectedHistoryItem && (
        <QuestionCardItem item={selectedHistoryItem} config={config} />
      )}
    </div>
  );
}

function HistorySidebar({
  history,
  config,
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
    <CommonWrapper>
      <div className="h-[620px] overflow-y-auto overflow-x-hidden">
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
  selectedHistoryItem,
  setSelectedHistoryItem,
}: {
  item: HistoryItem;
  config: CampaignConfig;
  selectedHistoryItem: HistoryItem | undefined;
  setSelectedHistoryItem: (item: HistoryItem | undefined) => void;
}) {
  const question = getQuestionById(item.questionId, config);
  return (
    <div
      className={classNames(
        "w-[300px] border-b border-slate-200/50 p-2 cursor-pointer",
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
        <div>
          <Text className="max-w-[200px] truncate" color="gray" weight="bold">
            {question?.title ?? question?.question}
          </Text>
        </div>
      </div>
    </div>
  );
}

function getQuestionById(questionId: string, config: CampaignConfig) {
  return config.questions.find((q) => q.id === questionId);
}

function QuestionCardItem({
  item,
  config,
}: {
  item: HistoryItem | null;
  config: CampaignConfig;
}) {
  const question = getQuestionById(item?.questionId || "", config);

  if (!question) {
    return null;
  }

  return (
    <CommonWrapper>
      <div className="p-2">
        <Heading level={4} color="lightBlue" className="mb-4">
          {question?.question}
        </Heading>
        {question?.possibleAnswers.map((a, index) => (
          <AnswerRow
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
