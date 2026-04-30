import {
  GameStateEngine,
  type SavedCampaignSessionInfo,
} from "@/logic/application";
import { Dialog, DialogBody, DialogHeader } from "../Dialog";
import { container } from "tsyringe";
import { Text } from "../Text";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { useState } from "react";
import { TextInput } from "../TextInput";
import classNames from "classnames";

interface SaveGameSessionProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function SaveGameSession({ isOpen, setIsOpen }: SaveGameSessionProps) {
  const gameStateEngine = container.resolve(GameStateEngine);
  const { usedSlots, availableSlots } = gameStateEngine.getSessionSlots();
  const activeCampaignId = gameStateEngine.getCampaignState().activeCampaignId;

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} closeOnBackdrop>
      <DialogHeader>Save Game</DialogHeader>
      <DialogBody>
        <SaveGameSessionBody
          activeCampaignId={activeCampaignId}
          availableSlots={availableSlots}
          usedSlots={usedSlots}
          onSave={(name) =>
            gameStateEngine.saveGameState(name)
          }
          onClose={() => setIsOpen(false)}
        />
      </DialogBody>
    </Dialog>
  );
}

type SlotSelection =
  | { type: "empty"; index: number; name: string }
  | { type: "used"; session: SavedCampaignSessionInfo };

interface SaveGameSessionBodyProps {
  availableSlots: number;
  usedSlots: SavedCampaignSessionInfo[];
  onSave: (name: string, existingSessionId?: string) => void;
  onClose: () => void;
  activeCampaignId: string | null;
}

function SaveGameSessionBody({
  availableSlots,
  usedSlots,
  onSave,
  onClose,
  activeCampaignId,
}: SaveGameSessionBodyProps) {
  const [selection, setSelection] = useState<SlotSelection | null>(null);

  const canSave =
    selection !== null &&
    (selection.type === "used" || selection.name.trim() !== "");

  const handleSave = () => {
    if (!selection) return;
    const name =
      selection.type === "used" ? selection.session.name : selection.name;
    const existingSessionId =
      selection.type === "used" ? selection.session.sessionId : undefined;
    onSave(name, existingSessionId);
    onClose();
  };

  const handleEmptySelect = (index: number) => {
    setSelection({
      type: "empty",
      index,
      name: `auto-save-${activeCampaignId}-${new Date().toLocaleString()}`,
    });
  };

  const handleEmptyNameChange = (name: string) => {
    if (selection?.type === "empty") {
      setSelection({ ...selection, name });
    }
  };

  return (
    <div>
      <div
        className="max-h-[250px] flex flex-col gap-3 overflow-y-auto"
        tabIndex={0}
      >
        <div className="mr-2">
          {Array.from({ length: availableSlots }).map((_, index) => (
            <EmptySlot
              key={index}
              index={index}
              isSelected={
                selection?.type === "empty" && selection.index === index
              }
              name={
                selection?.type === "empty" && selection.index === index
                  ? selection.name
                  : ""
              }
              onSelect={handleEmptySelect}
              onNameChange={handleEmptyNameChange}
            />
          ))}
          {usedSlots.map((sessionInfo) => (
            <UsedSlot
              key={sessionInfo.sessionId}
              sessionInfo={sessionInfo}
              isSelected={
                selection?.type === "used" &&
                selection.session.sessionId === sessionInfo.sessionId
              }
              onSelect={(session) => setSelection({ type: "used", session })}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-2">
        <Button variant="tertiary" size="large" onClick={onClose}>
          <Icon name="backspace-fill" />
          <Text weight="medium" color="lightBlue">
            Back
          </Text>
        </Button>
        <Button size="large" disabled={!canSave} onClick={handleSave}>
          <Text weight="medium" color="lightBlue">
            Save game
          </Text>
        </Button>
      </div>
    </div>
  );
}

function EmptySlot({
  index,
  isSelected,
  name,
  onSelect,
  onNameChange,
}: {
  index: number;
  isSelected: boolean;
  name: string;
  onSelect: (index: number) => void;
  onNameChange: (name: string) => void;
}) {
  return (
    <div
      className={classNames(
        "p-3 border rounded cursor-pointer mb-2 min-h-[75px]",
        {
          "bg-blue-200 border-blue-500": isSelected,
          "bg-blue-100/50 border-gray-300": !isSelected,
        },
      )}
      onClick={() => onSelect(index)}
    >
      <div className="flex flex-col justify-center items-center h-full">
        {isSelected ? (
          <TextInput
            placeholder="Save name..."
            value={name}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              onNameChange(e.target.value);
            }}
          />
        ) : (
          <Text color="lightBlue">Empty slot</Text>
        )}
      </div>
    </div>
  );
}

function UsedSlot({
  sessionInfo,
  isSelected,
  onSelect,
}: {
  sessionInfo: SavedCampaignSessionInfo;
  isSelected: boolean;
  onSelect: (session: SavedCampaignSessionInfo) => void;
}) {
  return (
    <div
      className={classNames("p-3 border rounded cursor-pointer mb-2", {
        "bg-blue-200 border-blue-500": isSelected,
        "bg-blue-100/50 border-gray-300": !isSelected,
      })}
      onClick={() => onSelect(sessionInfo)}
    >
      <div className="flex flex-col justify-center items-center">
        <Text color="darkBlue" weight="bold">
          {sessionInfo.name}
        </Text>
        <Text color="darkBlue" weight="normal">
          {formatDate(sessionInfo.lastSaved)}
        </Text>
      </div>
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) return "Unknown date";
  return new Date(date).toLocaleString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
