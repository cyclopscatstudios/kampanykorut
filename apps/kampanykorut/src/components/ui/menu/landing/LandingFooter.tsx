import { t } from "i18next";
import { Link } from "react-router-dom";
import { Text } from "../../../../../../../shared/ui/Text";
import { PRIVACY_PATH } from "../../../../logic/application/privacyPath";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 text-center flex flex-col gap-2">
      <Text color="gray" size="xs">
        {t("landing.footer")}
      </Text>
      <Link
        to={PRIVACY_PATH}
        className="text-xs text-slate-400 underline hover:text-slate-200"
      >
        {t("landing.footerPrivacy")}
      </Link>
    </footer>
  );
}
