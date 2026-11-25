import { Button } from "@shared/ui/Button";
import { Icon } from "@shared/ui/Icon";
import { Text } from "@shared/ui/Text";
import { t } from "i18next";
import { useNavigation } from "../../../hooks/navigationHook";
import { loadSession } from "../gameplay/loadSession";
import { SavedSessionsBody } from "../gameplay/SavedGameSessionsDialog";
import { useSavedSessionList } from "../gameplay/useSavedSessionList";

export function LoadSavedSessionsMenu() {
  const { savedSessions, selectedSession, setSelectedSession, deleteSession } =
    useSavedSessionList();
  const { goBack } = useNavigation();
  return (
    <div className="w-full max-w-md px-4 md:px-0">
      <SavedSessionsBody
        savedSessions={savedSessions}
        selectedSession={selectedSession}
        setSelectedSession={setSelectedSession}
        onDelete={deleteSession}
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
          onClick={() => loadSession(selectedSession)}
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
