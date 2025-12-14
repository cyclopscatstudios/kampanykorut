import { useEffect, useState } from "react";
import { eventEmitter } from "./EventEmitter";
import hu_lang from "./langs/hu_lang.json";
import en_lang from "./langs/en_lang.json";

export function useTranslateLang(langKey: string) {
  const [tJson, setTJson] = useState<{ key: string; lang: string }[]>(en_lang);

  useEffect(() => {
    const unsubscribe = eventEmitter.on("changeLanguage", (lang) => {
      setTJson(lang === "hu" ? hu_lang : en_lang);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const translate = tJson.find((l) => l.key === langKey);

  return translate?.lang ?? "";
}
