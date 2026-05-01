import {
  CampaignStateEngine,
  type SavedCampaignSessionInfo,
} from "@/logic/application";
import { SavedSessionsBody } from "../gameplay/SavedGameSessionsDialog";
import { container } from "tsyringe";
import { Button } from "../Button";
import { useNavigation } from "../../../hooks/navigationHook";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { useState } from "react";

export function LoadSavedSessionsMenu() {
  const [selectedSession, setSelectedSession] =
    useState<SavedCampaignSessionInfo | null>(null);
  const gameStateEngine = container.resolve(CampaignStateEngine);
  const savedSessions = gameStateEngine.getSavedGameSessions();
  const { goBack } = useNavigation();
  return (
    <div>
      <SavedSessionsBody
        savedSessions={savedSessions}
        selectedSession={selectedSession}
        setSelectedSession={setSelectedSession}
      />
      <div className="pt-5 flex justify-between">
        <Button variant="tertiary" size="large" onClick={goBack}>
          <Icon name="backspace-fill" />
          <Text weight="medium" color="lightBlue">
            Back
          </Text>
        </Button>
        <Button size="large" disabled={!selectedSession}>
          <Text weight="medium" color="lightBlue">
            Load game
          </Text>
        </Button>
      </div>
    </div>
  );
}
