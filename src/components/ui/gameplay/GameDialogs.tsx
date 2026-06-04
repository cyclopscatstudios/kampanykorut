import { t } from "i18next";
import { SaveGameSession } from "../menu/SaveGameSession";
import { Modal } from "../Modal";
import { GameDialog } from "./GameDialog";
import type { DialogId } from "./hooks/useDialogState";
import { SavedSessionsDialog } from "./SavedGameSessionsDialog";
import { SettingsDialog } from "./SettingsDialog";

interface GameDialogsProps {
  activeDialog: DialogId;
  onClose: () => void;
  onConfirmExit: () => void;
}

export function GameDialogs({
  activeDialog,
  onClose,
  onConfirmExit,
}: GameDialogsProps) {
  const close = () => onClose();

  return (
    <>
      <SaveGameSession isOpen={activeDialog === "saveGame"} setIsOpen={close} />
      <SavedSessionsDialog
        isOpen={activeDialog === "savedGames"}
        setIsOpen={close}
      />
      <SettingsDialog isOpen={activeDialog === "settings"} setIsOpen={close} />
      <GameDialog isOpen={activeDialog === "gameMenu"} setIsOpen={close} />
      {activeDialog === "exit" && (
        <Modal
          title={t("exitDialog.title")}
          description={t("exitDialog.description")}
          onCancel={onClose}
          onConfirm={onConfirmExit}
        />
      )}
    </>
  );
}
