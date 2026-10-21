import { t } from "i18next";
import { useState } from "react";
import { container } from "tsyringe";
import {
  type SavedCampaignSessionInfo,
  StateEngine,
} from "@/logic/application";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import { useNavigation } from "../../../hooks/navigationHook";
import { SavedSessionsBody } from "../gameplay/SavedGameSessionsDialog";

export function LoadSavedSessionsMenu() {
  const [selectedSession, setSelectedSession] =
    useState<SavedCampaignSessionInfo | null>(null);
  const gameStateEngine = container.resolve(StateEngine);
  const savedSessions = [
    ...gameStateEngine.getAutoSaveSessions(),
    ...gameStateEngine.getSavedGameSessions(),
  ];
  const { goBack } = useNavigation();
  return (
    <div className="w-full max-w-md px-4 md:px-0">
      <SavedSessionsBody
        savedSessions={savedSessions}
        selectedSession={selectedSession}
        setSelectedSession={setSelectedSession}
      />
      <div className="pt-5 flex flex-col-reverse gap-2 *:w-full md:flex-row md:justify-between md:*:w-auto">
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
