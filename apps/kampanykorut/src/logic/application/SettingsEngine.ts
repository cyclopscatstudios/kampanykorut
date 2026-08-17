import { inject, singleton } from "tsyringe";
import { createLogger } from "@/shared/logger/logger";
import { GameSettings, LanguageId, supportedLanguages } from "@/shared/types";
import { setLanguage } from "../i18n/i18n";
import { Emitter } from "./Emitter";
import { StorageEngine } from "./StorageEngine";

const log = createLogger("SettingsEngine");

@singleton()
export class SettingsEngine extends Emitter<GameSettings> {
  private defaultSettings: GameSettings = {
    showAdvisorFeedback: true,
    language: "en",
  };

  constructor(@inject(StorageEngine) private storage: StorageEngine) {
    log.debug("SettingsEngine initialized");
    super();
    this.init();
  }

  private init() {
    const browserLanguage = this.getBrowserLanguage();
    const currentSettings = this.storage.getItem("settings", "localStorage");
    const defaultSettings = {
      showAdvisorFeedback: true,
      language: browserLanguage,
    };
    this.defaultSettings = defaultSettings;
    const settings = currentSettings
      ? JSON.parse(currentSettings)
      : defaultSettings;
    log.debug("Initializing settings with: ", settings);
    this.updateGameSettings(settings);
  }

  getGameSettings(): GameSettings {
    const stored = this.storage.getItem("settings", "localStorage");
    return stored ? JSON.parse(stored) : this.defaultSettings;
  }

  updateGameSettings(settings: Partial<GameSettings>): void {
    const current = this.getGameSettings();
    const updated = { ...current, ...settings };
    if (settings.language) {
      setLanguage(settings.language);
    }
    this.notify(updated);
    this.storage.setItem("settings", JSON.stringify(updated), "localStorage");
  }

  private getBrowserLanguage(): LanguageId {
    for (const language of navigator.languages) {
      const shortLanguage = language.split("-")[0] as LanguageId;

      if (supportedLanguages.map((l) => l.id).includes(shortLanguage)) {
        return shortLanguage;
      }
    }

    return "en";
  }
}
