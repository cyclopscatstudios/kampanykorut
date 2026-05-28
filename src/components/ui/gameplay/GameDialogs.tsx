import { SaveGameSession } from "../menu/SaveGameSession";
import { SavedSessionsDialog } from "./SavedGameSessionsDialog";
import { SettingsDialog } from "./SettingsDialog";
import { GameDialog } from "./GameDialog";
import { Modal } from "../Modal";
import type { DialogId } from "./hooks/useDialogState";
import { t } from "i18next";

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
