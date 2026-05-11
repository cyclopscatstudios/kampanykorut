import {
  StateEngine,
  type SavedCampaignSessionInfo,
} from "@/logic/application";
import { Button } from "../Button";
import { DialogHeader, Dialog, DialogBody, DialogFooter } from "../Dialog";
import { Heading } from "../Heading";
import { container } from "tsyringe";
import { Text } from "../Text";
import { useState } from "react";
import { t } from "i18next";

export function SavedSessionsDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
  const gameStateEngine = container.resolve(StateEngine);
  const savedSessions = gameStateEngine.getSavedGameSessions();
  const [selectedSession, setSelectedSession] =
    useState<SavedCampaignSessionInfo | null>(null);
  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <DialogHeader>
        <Heading level={3} color="lightBlue">
          Load Game
        </Heading>
      </DialogHeader>
      <DialogBody>
        <SavedSessionsBody
          savedSessions={savedSessions}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
        />
      </DialogBody>
      <DialogFooter>
        <div className="w-full flex justify-between">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            <Button.Text>Cancel</Button.Text>
          </Button>
          <Button
            disabled={!selectedSession}
            onClick={() => gameStateEngine.loadState(selectedSession)}
          >
            <Button.Text>Load Game</Button.Text>
          </Button>
        </div>
      </DialogFooter>
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
    <div
      className="max-h-[250px] flex flex-col gap-3 overflow-y-auto"
      tabIndex={0}
    >
      {Object.keys(savedSessions).length === 0 && (
        <div>{t("loadSavedGamesMenu.emptyLabel")}</div>
      )}
      {savedSessions.map((value) => (
        <div
          key={value.id}
          className={`p-3 border rounded cursor-pointer ${
            selectedSession?.id === value.id
              ? "bg-blue-200 border-blue-500"
              : "bg-blue-100/50 border-gray-300"
          }`}
          onClick={() => setSelectedSession(value)}
        >
          <div className="flex flex-col justify-center items-center">
            <Text color="darkBlue" weight="bold">
              {value.name}
            </Text>
            <Text color="darkBlue" weight="normal">
              {formatDate(value.lastSaved)}
            </Text>
          </div>
        </div>
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
