import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { container } from "tsyringe";
import en from "../langs/en_lang.json";
import hu from "../langs/hu_lang.json";
import { StorageEngine } from "../application/StorageEngine";

export const SUPPORTED_LANGUAGES = ["en", "hu"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const DEFAULT_LANGUAGE: Language = "en";
const STORAGE_KEY = "language";

function readStoredLanguage(storage: StorageEngine): Language {
  const stored = storage.getItem(STORAGE_KEY, "localStorage");
  if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
    return stored as Language;
  }
  return DEFAULT_LANGUAGE;
}

const storage = container.resolve(StorageEngine);

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hu: { translation: hu },
  },
  lng: readStoredLanguage(storage),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  storage.setItem(STORAGE_KEY, lng, "localStorage");
});

export function setLanguage(lang: Language) {
  i18n.changeLanguage(lang);
}

export default i18n;
