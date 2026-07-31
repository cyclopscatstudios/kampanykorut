import { useState } from "react";

export type DialogId =
  | "settings"
  | "gameMenu"
  | "exit"
  | "savedGames"
  | "saveGame"
  | "bugReporter"
  | null;

export function useDialogState() {
  const [activeDialog, setActiveDialog] = useState<DialogId>(null);

  return {
    activeDialog,
    open: (id: Exclude<DialogId, null>) => setActiveDialog(id),
    close: () => setActiveDialog(null),
  };
}
