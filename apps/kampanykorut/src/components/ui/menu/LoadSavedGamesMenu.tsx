import { t } from "i18next";
import { useState } from "react";
import { container } from "tsyringe";
import {
  type SavedCampaignSessionInfo,
  StateEngine,
} from "@/logic/application";
import { useNavigation } from "../../../hooks/navigationHook";
import { Button } from "../Button";
import { SavedSessionsBody } from "../gameplay/SavedGameSessionsDialog";
import { Icon } from "../Icon";
import { Text } from "../Text";

export function LoadSavedSessionsMenu() {
  const [selectedSession, setSelectedSession] =
    useState<SavedCampaignSessionInfo | null>(null);
  const gameStateEngine = container.resolve(StateEngine);
  const savedSessions = gameStateEngine.getSavedGameSessions();
  const { goBack } = useNavigation();
  return (
    <div>
      <SavedSessionsBody
        savedSessions={savedSessions}
        selectedSession={selectedSession}
        setSelectedSession={setSelectedSession}
      />
      <div className="min-w-[350px] pt-5 flex justify-between">
        <Button variant="tertiary" size="large" onClick={goBack}>
          <Icon name="backspace-fill" />
          <Text weight="medium" color="lightBlue">
            {t("menuList.button.back")}
          </Text>
        </Button>
        <Button
          size="large"
          onClick={() => gameStateEngine.loadState(selectedSession)}
          disabled={!selectedSession}
        >
          <Text weight="medium" color="lightBlue">
            {t("loadSavedGamesMenu.button.load")}
          </Text>
        </Button>
      </div>
    </div>
  );
}
