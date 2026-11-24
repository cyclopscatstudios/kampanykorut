import { Icon } from "@shared/ui/Icon";
import { Tooltip } from "@shared/ui/Tooltip";
import { t } from "i18next";

export function SaveExpiryNote() {
  return (
    <div className="flex justify-center pt-1">
      <Tooltip content={t("savedSessions.expiryHint")}>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <Icon name="hourglass-split" size={12} color="currentColor" />
          {t("savedSessions.expiryLabel")}
        </span>
      </Tooltip>
    </div>
  );
}
