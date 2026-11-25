import type { CampaignHeader } from "@logic/application";
import type { IconName } from "@shared/types";
import { Icon } from "@shared/ui/Icon";
import { Tooltip } from "@shared/ui/Tooltip";
import classNames from "classnames";
import { t } from "i18next";
import { getCampaignGameModes } from "./campaignSelector.utils";

const chipBase =
  "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs whitespace-nowrap";

export function CampaignChips({
  campaign,
}: {
  campaign: Pick<CampaignHeader, "tags" | "gameMode" | "gameModes">;
}) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {campaign.tags.map((tag) => (
        <span
          key={tag}
          className={classNames(
            chipBase,
            "border-slate-400/30 bg-slate-400/12 font-medium text-slate-300",
          )}
        >
          {t(`campaignSelector.tags.${tag}`, { defaultValue: tag })}
        </span>
      ))}
      {getCampaignGameModes(campaign).map((mode) => (
        <ModeChip key={mode} strategic={mode === "strategic"} />
      ))}
    </span>
  );
}

function ModeChip({ strategic }: { strategic: boolean }) {
  return (
    <Tooltip
      content={t(
        strategic
          ? "campaignSelector.mode.strategicHint"
          : "campaignSelector.mode.classicHint",
      )}
    >
      <span
        className={classNames(
          chipBase,
          "pl-2 font-semibold",
          strategic
            ? "border-purple-300 bg-purple-600/25 text-blue-50"
            : "border-slate-600 text-slate-300",
        )}
      >
        {strategic ? (
          <Icon name="bullseye" color="purple" size="xs" />
        ) : (
          <ClassicIcon />
        )}
        {t(
          strategic
            ? "campaignSelector.mode.strategic"
            : "campaignSelector.mode.classic",
        )}
      </span>
    </Tooltip>
  );
}

export function ClassicIcon() {
  return (
    <Icon
      name={"classic" as IconName}
      source="svg"
      color="currentColor"
      size="xs"
    />
  );
}

export function NewBadge() {
  return (
    <span className="shrink-0 rounded bg-[#e0a23b] px-1.5 py-0.5 text-[9px] leading-normal font-extrabold tracking-[0.14em] text-[#1a1206] uppercase">
      {t("campaignSelector.new")}
    </span>
  );
}
