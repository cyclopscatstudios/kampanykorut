import { useTranslation } from "react-i18next";
import type { ParseKeys } from "i18next";

export function useTranslateLang(langKey: ParseKeys) {
  const { t } = useTranslation();
  return t(langKey);
}

export function useTranslate() {
  const { t } = useTranslation();
  return t;
}
