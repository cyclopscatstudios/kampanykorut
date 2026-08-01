import { t } from "i18next";
import { useState } from "react";
import { type GameSettings } from "@/logic/application";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import { useNavigation } from "../../../hooks/navigationHook";
import { useSettings } from "../../../logic/application/hooks/useSettings";
import { SettingsBody } from "../gameplay/SettingsDialog";
import { toaster } from "../gameplay/toaster";

export function SettingsMenu() {
  const { settings, updateSettings } = useSettings();
  const [settingsForm, setSettingsForm] = useState<GameSettings>(settings);
  const { goBack } = useNavigation();

  const isEqual = JSON.stringify(settings) === JSON.stringify(settingsForm);

  const saveChanges = () => {
    updateSettings({ ...settingsForm });
    toaster(t("toaster.settingsUpdated"), "Success");
  };

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
            {t("menuList.button.back")}
          </Text>
        </Button>
        <Button
          size="large"
          onClick={saveChanges}
          disabled={isEqual}
          testId="saveButton"
        >
          <Text weight="medium" color="lightBlue">
            {t("menuList.button.save")}
          </Text>
        </Button>
      </div>
    </div>
  );
}
