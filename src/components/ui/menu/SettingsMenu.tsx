import { SettingsEngine, type GameSettings } from "@/logic/application";
import { SettingsBody } from "../gameplay/SettingsDialog";
import { container } from "tsyringe";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { useEffect, useState } from "react";
import { useNavigation } from "../../../hooks/navigationHook";

export function SettingsMenu() {
  const settingsEngine = container.resolve(SettingsEngine);
  const [settings, setSettings] = useState<GameSettings>(() =>
    settingsEngine.getGameSettings(),
  );
  const [settingsForm, setSettingsForm] = useState<GameSettings>(settings);
  const { goBack } = useNavigation();

  const isEqual = JSON.stringify(settings) === JSON.stringify(settingsForm);

  const saveChanges = () => {
    settingsEngine.updateGameSettings({ ...settingsForm });
  };

  useEffect(() => {
    return settingsEngine.subscribe(setSettings);
  }, []);

  return (
    <div>
      <SettingsBody
        settingsForm={settingsForm}
        setSettingsForm={setSettingsForm}
      />
      <div className="pt-5 flex justify-between">
        <Button variant="tertiary" size="large" onClick={goBack}>
          <Icon name="backspace-fill" />
          <Text weight="medium" color="lightBlue">
            back
          </Text>
        </Button>
        <Button size="large" onClick={saveChanges} disabled={isEqual}>
          <Text weight="medium" color="lightBlue">
            save
          </Text>
        </Button>
      </div>
    </div>
  );
}
