import { useEffect, useState } from "react";
import { container } from "tsyringe";
import { GameSettings } from "@/shared/types";
import { SettingsEngine } from "../SettingsEngine";

export function useSettings() {
  const settingsEngine = container.resolve(SettingsEngine);
  const [settings, setSettings] = useState<GameSettings>(() =>
    settingsEngine.getGameSettings(),
  );

  useEffect(() => {
    return settingsEngine.subscribe(setSettings);
  }, [settingsEngine]);

  return {
    settings,
    updateSettings: (settings: Partial<GameSettings>) =>
      settingsEngine.updateGameSettings(settings),
  };
}
