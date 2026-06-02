import { container } from "tsyringe";
import { SettingsEngine, type GameSettings } from "../SettingsEngine";
import { useEffect, useState } from "react";

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
