import { useTranslation } from "react-i18next";

export function useTranslateLang(langKey: string) {
  const { t } = useTranslation();
  return t(langKey);
}

export function useTranslate() {
  const { t } = useTranslation();
  return t;
}
