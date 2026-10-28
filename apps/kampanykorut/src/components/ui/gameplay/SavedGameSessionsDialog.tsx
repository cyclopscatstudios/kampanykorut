import classNames from "classnames";
import { t } from "i18next";
import { useState } from "react";
import { container } from "tsyringe";
import {
  type SavedCampaignSessionInfo,
  StateEngine,
} from "@/logic/application";
import { Button } from "../../../../../../shared/ui/Button";
import { Text } from "../../../../../../shared/ui/Text";
import { Dialog, DialogBody, DialogHeader } from "../Dialog";
import { Heading } from "../Heading";
import { loadSession } from "./loadSession";

export function SavedSessionsDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
  const gameStateEngine = container.resolve(StateEngine);
  const savedSessions = [
    ...gameStateEngine.getAutoSaveSessions(),
    ...gameStateEngine.getSavedGameSessions(),
  ];
  const [selectedSession, setSelectedSession] =
    useState<SavedCampaignSessionInfo | null>(null);

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      buttons={{
        secondary: (
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            <Button.Text>{t("menuList.button.cancel")}</Button.Text>
          </Button>
        ),
        primary: (
          <Button
            disabled={!selectedSession}
            onClick={() => loadSession(selectedSession)}
          >
            <Button.Text>{t("loadSavedGamesMenu.button.load")}</Button.Text>
          </Button>
        ),
      }}
    >
      <DialogHeader>
        <Heading level={3} color="lightBlue">
          {t("loadSavedGamesMenu.button.load")}
        </Heading>
      </DialogHeader>
      <DialogBody>
        <SavedSessionsBody
          savedSessions={savedSessions}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
        />
      </DialogBody>
    </Dialog>
  );
}

export function SavedSessionsBody({
  savedSessions,
  selectedSession,
  setSelectedSession,
}: {
  savedSessions: SavedCampaignSessionInfo[];
  selectedSession: SavedCampaignSessionInfo | null;
  setSelectedSession: (session: SavedCampaignSessionInfo | null) => void;
}) {
  return (
    <div className="max-h-[50vh] md:max-h-75 flex flex-col gap-2 overflow-y-auto pr-1">
      {savedSessions.length === 0 && (
        <Text className="text-center">
          {t("loadSavedGamesMenu.emptyLabel")}
        </Text>
      )}
      {savedSessions.map((value) => (
        <button
          key={value.id}
          type="button"
          aria-pressed={selectedSession?.id === value.id}
          className={classNames(
            "w-full min-h-16 p-3 border rounded flex flex-col justify-center items-center text-center cursor-pointer shrink-0",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
            {
              "bg-blue-200 border-blue-500": selectedSession?.id === value.id,
              "bg-blue-100/50 border-gray-300 hover:bg-blue-100/70":
                selectedSession?.id !== value.id,
            },
          )}
          onClick={() => setSelectedSession(value)}
        >
          <Text color="darkBlue" weight="bold" className="break-all">
            {value.type === "auto"
              ? `${t("loadSavedGamesMenu.autoSaveLabel")}-${value.campaignId}`
              : value.name}
          </Text>
          <Text color="darkBlue" weight="normal" size="sm">
            {value.type === "auto" && value.turn !== undefined
              ? t("loadSavedGamesMenu.turn", { turn: value.turn })
              : null}
          </Text>
          <Text color="darkBlue" weight="normal" size="sm">
            {formatDate(value.lastSaved)}
          </Text>
        </button>
      ))}
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) {
    return "Unknown date";
  }
  return new Date(date).toLocaleString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
