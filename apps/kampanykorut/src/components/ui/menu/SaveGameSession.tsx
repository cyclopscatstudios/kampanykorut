import { type SavedCampaignSessionInfo, StateEngine } from "@logic/application";
import { Button } from "@shared/ui/Button";
import { Text } from "@shared/ui/Text";
import classNames from "classnames";
import { t } from "i18next";
import { useState } from "react";
import { container } from "tsyringe";
import { Dialog, DialogBody, DialogHeader } from "../Dialog";
import { DeleteSaveButton } from "../gameplay/DeleteSaveButton";
import { SaveExpiryNote } from "../gameplay/SaveExpiryNote";
import { Heading } from "../Heading";
import { TextInput } from "../TextInput";

interface SaveGameSessionProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

type SlotSelection =
  | { type: "empty"; index: number; name: string }
  | { type: "used"; session: SavedCampaignSessionInfo; name: string };

export function SaveGameSession({ isOpen, setIsOpen }: SaveGameSessionProps) {
  const gameStateEngine = container.resolve(StateEngine);
  const { usedSlots, availableSlots } = gameStateEngine.getSessionSlots();
  const activeCampaignId =
    gameStateEngine.getCampaignState()?.activeCampaignId ?? "";
  const [selection, setSelection] = useState<SlotSelection | null>(null);
  const [, setVersion] = useState(0);

  const canSave = selection !== null && selection.name.trim() !== "";

  const deleteSlot = (session: SavedCampaignSessionInfo) => {
    gameStateEngine.deleteSavedSession(session);
    if (selection?.type === "used" && selection.session.id === session.id) {
      setSelection(null);
    }
    setVersion((v) => v + 1);
  };

  const close = () => {
    setSelection(null);
    setIsOpen(false);
  };

  const handleSave = () => {
    if (!selection) return;
    gameStateEngine.saveToSlot(
      selection.name.trim(),
      selection.type === "used" ? selection.session.id : undefined,
    );
    close();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={close}
      buttons={{
        secondary: (
          <Button variant="secondary" onClick={close}>
            <Button.Text>{t("menuList.button.cancel")}</Button.Text>
          </Button>
        ),
        primary: (
          <Button disabled={!canSave} onClick={handleSave}>
            <Button.Text>{t("menuList.button.save")}</Button.Text>
          </Button>
        ),
      }}
    >
      <DialogHeader>
        <Heading level={3} color="lightBlue">
          {t("gameMenuBar.save")}
        </Heading>
      </DialogHeader>
      <DialogBody>
        <SaveGameSessionBody
          activeCampaignId={activeCampaignId}
          availableSlots={availableSlots}
          usedSlots={usedSlots}
          selection={selection}
          setSelection={setSelection}
          onDelete={deleteSlot}
        />
      </DialogBody>
    </Dialog>
  );
}

interface SaveGameSessionBodyProps {
  availableSlots: number;
  usedSlots: SavedCampaignSessionInfo[];
  activeCampaignId: string;
  selection: SlotSelection | null;
  setSelection: (selection: SlotSelection) => void;
  onDelete: (session: SavedCampaignSessionInfo) => void;
}

function SaveGameSessionBody({
  availableSlots,
  usedSlots,
  activeCampaignId,
  selection,
  setSelection,
  onDelete,
}: SaveGameSessionBodyProps) {
  const selectEmptySlot = (index: number) => {
    setSelection({
      type: "empty",
      index,
      name: `${activeCampaignId}-${new Date().toLocaleString()}`,
    });
  };

  const changeName = (name: string) => {
    if (selection) {
      setSelection({ ...selection, name });
    }
  };

  return (
    <div className="max-h-[50vh] md:max-h-75 flex flex-col gap-2 overflow-y-auto pr-1">
      {Array.from({ length: availableSlots }).map((_, index) =>
        selection?.type === "empty" && selection.index === index ? (
          <div key={index} className={slotClassName(true)}>
            <TextInput
              placeholder={t("emptySlot.placeholder")}
              value={selection.name}
              autoFocus
              onChange={(e) => changeName(e.target.value)}
            />
          </div>
        ) : (
          <button
            key={index}
            type="button"
            className={slotClassName(false)}
            onClick={() => selectEmptySlot(index)}
          >
            <Text color="lightBlue">{t("emptySlot.label")}</Text>
          </button>
        ),
      )}
      {usedSlots.map((sessionInfo) => {
        const isSelected =
          selection?.type === "used" && selection.session.id === sessionInfo.id;
        return (
          <div key={sessionInfo.id} className="relative shrink-0">
            {isSelected ? (
              <div className={classNames(slotClassName(true), "pr-12")}>
                <TextInput
                  placeholder={t("emptySlot.placeholder")}
                  value={selection.name}
                  autoFocus
                  onChange={(e) => changeName(e.target.value)}
                />
                <Text color="darkBlue" weight="normal" size="sm">
                  {formatDate(sessionInfo.lastSaved)}
                </Text>
              </div>
            ) : (
              <button
                type="button"
                className={classNames(slotClassName(false), "px-12")}
                onClick={() =>
                  setSelection({
                    type: "used",
                    session: sessionInfo,
                    name: sessionInfo.name,
                  })
                }
              >
                <Text color="darkBlue" weight="bold" className="break-all">
                  {sessionInfo.name}
                </Text>
                <Text color="darkBlue" weight="normal" size="sm">
                  {formatDate(sessionInfo.lastSaved)}
                </Text>
              </button>
            )}
            <div className="absolute top-2 right-2">
              <DeleteSaveButton onConfirm={() => onDelete(sessionInfo)} />
            </div>
          </div>
        );
      })}
      {usedSlots.length > 0 && <SaveExpiryNote />}
    </div>
  );
}

function slotClassName(isSelected: boolean) {
  return classNames(
    "w-full min-h-[64px] p-3 border rounded flex flex-col justify-center items-center gap-1 text-center cursor-pointer shrink-0",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
    {
      "bg-blue-200 border-blue-500": isSelected,
      "bg-blue-100/50 border-gray-300 hover:bg-blue-100/70": !isSelected,
    },
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
