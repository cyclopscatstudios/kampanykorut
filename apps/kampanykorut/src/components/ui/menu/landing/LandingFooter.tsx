import { t } from "i18next";
import { Text } from "../../../../../../../shared/ui/Text";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 text-center">
      <Text color="gray" size="xs">
        {t("landing.footer")}
      </Text>
    </footer>
  );
}
