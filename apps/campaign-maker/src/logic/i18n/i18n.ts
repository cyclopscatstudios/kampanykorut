import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../langs/en_lang.json";
import hu from "../langs/hu_lang.json";

export const SUPPORTED_LANGUAGES = ["en", "hu"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const DEFAULT_LANGUAGE: Language = "en";

// campaign-maker has no language switcher yet, so it reads the kampanykörút
// app's own language preference (same localStorage key, shared browser).
const KAMPANYKORUT_LANGUAGE_STORAGE_KEY = "kampanykorut_language";

function readStoredLanguage(): Language {
  const stored = localStorage.getItem(KAMPANYKORUT_LANGUAGE_STORAGE_KEY);
  if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
    return stored as Language;
  }
  return DEFAULT_LANGUAGE;
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hu: { translation: hu },
  },
  lng: readStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

export default i18n;
