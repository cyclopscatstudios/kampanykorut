import { t } from "i18next";
import { useState } from "react";
import { type GameSettings } from "@/logic/application";
import { useSettings } from "../../../logic/application/hooks/useSettings";
import { supportedLanguages } from "../../../logic/langs/languages";
import { noop } from "../../../logic/utils";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../Dialog";
import { Dropdown } from "../Dropdown";
import { Heading } from "../Heading";
import { toaster } from "./toaster";

export function SettingsDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
  const { settings, updateSettings } = useSettings();
  const [settingsForm, setSettingsForm] = useState<GameSettings>(settings);

  const isEqual = JSON.stringify(settings) === JSON.stringify(settingsForm);

  const saveChanges = () => {
    updateSettings({ ...settingsForm });
    setIsOpen(false);
    toaster(t("toaster.settingsUpdated"), "Success");
  };

  return (
    <Dialog open={isOpen} onClose={noop} closeOnBackdrop>
      <DialogHeader>
        <div>
          <Heading level={3} color="lightBlue">
            {t("mainMenu.settings")}
          </Heading>
        </div>
      </DialogHeader>
      <DialogBody>
        <div>
          <SettingsBody
            settingsForm={settingsForm}
            setSettingsForm={setSettingsForm}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <div className="w-full flex justify-between">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            <Button.Text>{t("menuList.button.cancel")}</Button.Text>
          </Button>
          <Button onClick={saveChanges} disabled={isEqual}>
            <Button.Text>{t("menuList.button.save")}</Button.Text>
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}

export function SettingsBody({
  settingsForm,
  setSettingsForm,
}: {
  settingsForm: GameSettings;
  setSettingsForm: (s: any) => void;
}) {
  return (
    <div className="flex flex-col gap-5 h-full">
      <Checkbox
        label={t("settingsMenu.advisorFeedback.label")}
        defaultChecked={settingsForm.showAdvisorFeedback}
        onChange={(e) =>
          setSettingsForm((prev: GameSettings) => ({
            ...prev,
            showAdvisorFeedback: e.target.checked,
          }))
        }
      />
      <Dropdown
        options={[...supportedLanguages].map((lang) => ({
          label: lang.label,
          value: lang.id,
        }))}
        value={settingsForm.language}
        onChange={(value) =>
          setSettingsForm((prev: GameSettings) => ({
            ...prev,
            language: value,
          }))
        }
      />
    </div>
  );
}
