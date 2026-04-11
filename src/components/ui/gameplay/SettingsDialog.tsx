import { noop } from "../../../dev/FunctionUtils";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../Dialog";
import { Dropdown } from "../Dropdown";
import { Heading } from "../Heading";
import { supportedLanguages } from "../../../logic/langs/languages";
import { container } from "tsyringe";
import { SettingsEngine, type GameSettings } from "@/logic/application";
import { useState } from "react";

export function SettingsDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
  const settingsEngine = container.resolve(SettingsEngine);
  const settings = settingsEngine.getGameSettings();
  const [settingsForm, setSettingsForm] = useState<GameSettings>(settings);

  const isEqual = JSON.stringify(settings) === JSON.stringify(settingsForm);

  const saveChanges = () => {
    settingsEngine.updateGameSettings({ ...settingsForm });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={noop} closeOnBackdrop>
      <DialogHeader>
        <div>
          <Heading level={3} color="lightBlue">
            Settings
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
            <Button.Text>Cancel</Button.Text>
          </Button>
          <Button onClick={saveChanges} disabled={isEqual}>
            <Button.Text>Save</Button.Text>
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
        label="Show advisor feedback"
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
