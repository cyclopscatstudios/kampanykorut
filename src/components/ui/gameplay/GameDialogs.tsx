import { SaveGameSession } from "../menu/SaveGameSession";
import { SavedSessionsDialog } from "./SavedGameSessionsDialog";
import { SettingsDialog } from "./SettingsDialog";
import { GameDialog } from "./GameDialog";
import { Modal } from "../Modal";
import type { DialogId } from "./hooks/useDialogState";

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
      <SaveGameSession
        isOpen={activeDialog === "saveGame"}
        setIsOpen={close}
      />
      <SavedSessionsDialog
        isOpen={activeDialog === "savedGames"}
        setIsOpen={close}
      />
      <SettingsDialog
        isOpen={activeDialog === "settings"}
        setIsOpen={close}
      />
      <GameDialog
        isOpen={activeDialog === "gameMenu"}
        setIsOpen={close}
      />
      {activeDialog === "exit" && (
        <Modal
          title="Attention"
          description="Are you sure you want to exit the game?"
          onCancel={onClose}
          onConfirm={onConfirmExit}
        />
      )}
    </>
  );
}
