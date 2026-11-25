import type { CampaignHeader } from "@logic/application";
import { Icon } from "@shared/ui/Icon";
import { Tooltip } from "@shared/ui/Tooltip";
import classNames from "classnames";
import { t } from "i18next";
import { useId } from "react";
import { getCampaignGameModes } from "./campaignSelector.utils";

interface ModeSwitchProps {
  campaign: Pick<CampaignHeader, "gameMode" | "gameModes">;
  strategic: boolean;
  onChange: (strategic: boolean) => void;
  compact?: boolean;
}

export function ModeSwitch({
  campaign,
  strategic,
  onChange,
  compact,
}: ModeSwitchProps) {
  const labelId = useId();
  const modes = getCampaignGameModes(campaign);
  const padding = compact ? "px-3 py-2.5" : "px-3.5 py-3";

  if (!modes.includes("strategic")) {
    return null;
  }

  if (!modes.includes("classic")) {
    return (
      <div
        data-testid="strategicOnly"
        className={classNames(
          "flex items-center gap-3 rounded-lg border border-purple-300/35 bg-purple-600/12",
          padding,
        )}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-500/25 text-purple-200">
          <Icon name="bullseye" color="currentColor" size="sm" />
        </span>
        <span className="min-w-0 flex-1 text-sm font-semibold text-purple-200">
          {t("campaignSelector.mode.strategicOnly")}
        </span>
        <Icon name="lock" color="currentColor" className="text-purple-300" />
      </div>
    );
  }

  return (
    <div
      className={classNames(
        "flex items-center gap-3 rounded-lg border transition-colors duration-150",
        padding,
        strategic
          ? "border-purple-300 bg-purple-600/20"
          : "border-slate-400/25 bg-slate-400/6",
      )}
    >
      <span
        className={classNames(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          strategic
            ? "bg-purple-500 text-purple-50"
            : "bg-slate-400/14 text-slate-400",
        )}
      >
        <Icon name="bullseye" color="currentColor" size="sm" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span id={labelId} className="text-[15px] font-bold text-slate-50">
          {t("campaignSelector.mode.switchLabel")}
        </span>
        <span
          className={classNames(
            "text-xs font-medium",
            strategic ? "text-purple-200" : "text-slate-400",
          )}
        >
          {t("campaignSelector.mode.switchCaption")}
        </span>
      </span>
      <Tooltip content={t("campaignSelector.mode.switchHint")}>
        <span
          tabIndex={0}
          aria-label={t("campaignSelector.mode.switchHint")}
          className="flex size-8 cursor-help items-center justify-center rounded-full text-slate-400 hover:bg-purple-500/12 hover:text-purple-200"
        >
          <Icon name="info-circle" color="currentColor" />
        </span>
      </Tooltip>
      <button
        type="button"
        role="switch"
        aria-checked={strategic}
        aria-labelledby={labelId}
        data-testid="strategicModeSwitch"
        onClick={() => onChange(!strategic)}
        className={classNames(
          "relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300",
          strategic ? "bg-purple-500" : "bg-slate-600",
        )}
      >
        <span
          className={classNames(
            "absolute top-[3px] left-[3px] size-[22px] rounded-full bg-slate-50 shadow transition-transform duration-150",
            strategic ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}
