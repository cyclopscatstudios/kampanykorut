import { inject, singleton } from "tsyringe";
import { Emitter } from "./Emitter";
import { StorageEngine } from "./StorageEngine";
import { createLogger } from "../../../shared/logger/logger";
import { supportedLanguages } from "../langs/languages";
import { setLanguage } from "../i18n/i18n";

export type LanguageId = (typeof supportedLanguages)[number]["id"];

export interface GameSettings {
  showAdvisorFeedback: boolean;
  language: LanguageId;
}

const log = createLogger("SettingsEngine");

const DEFAULT_LANGUAGE: LanguageId = "en";
const defaultSettings = {
  showAdvisorFeedback: true,
  language: DEFAULT_LANGUAGE,
};

@singleton()
export class SettingsEngine extends Emitter<GameSettings> {
  constructor(@inject(StorageEngine) private storage: StorageEngine) {
    log.debug("SettingsEngine initialized");
    super();
    this.init();
  }

  private init() {
    const currentSettings = this.storage.getItem("settings", "localStorage");
    const settings = currentSettings
      ? JSON.parse(currentSettings)
      : defaultSettings;
    log.debug("Initializing settings with: ", settings);
    this.updateGameSettings(settings);
  }

  getGameSettings(): GameSettings {
    const stored = this.storage.getItem("settings", "localStorage");
    return stored ? JSON.parse(stored) : defaultSettings;
  }

  updateGameSettings(settings: Partial<GameSettings>): void {
    const current = this.getGameSettings();
    const updated = { ...current, ...settings };
    if (settings.language) {
      setLanguage(settings.language);
    }
    this.notify(updated);
    this.storage.setItem("settings", JSON.stringify(updated), "localStorage");

    console.trace();
  }
}
