import { type SavedCampaignSessionInfo, StateEngine } from "@logic/application";
import { useState } from "react";
import { container } from "tsyringe";

export function useSavedSessionList() {
  const gameStateEngine = container.resolve(StateEngine);
  const [, setVersion] = useState(0);
  const [selectedSession, setSelectedSession] =
    useState<SavedCampaignSessionInfo | null>(null);
  const savedSessions = [
    ...gameStateEngine.getAutoSaveSessions(),
    ...gameStateEngine.getSavedGameSessions(),
  ];

  const deleteSession = (session: SavedCampaignSessionInfo) => {
    gameStateEngine.deleteSavedSession(session);
    if (selectedSession?.id === session.id) {
      setSelectedSession(null);
    }
    setVersion((v) => v + 1);
  };

  return { savedSessions, selectedSession, setSelectedSession, deleteSession };
}
