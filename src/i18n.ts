import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enLang from "./logic/langs/en_lang.json";
import huLang from "./logic/langs/hu_lang.json";

export const defaultNS = "common";

function arrayToNested(arr: { key: string; lang: string }[]) {
  const result: Record<string, unknown> = {};
  for (const { key, lang } of arr) {
    const parts = key.split(".");
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = lang;
  }
  return result;
}

const resources = {
  en: { common: arrayToNested(enLang) },
  hu: { common: arrayToNested(huLang) },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "hu",
  fallbackLng: "en",
  defaultNS,
  ns: ["common"],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
