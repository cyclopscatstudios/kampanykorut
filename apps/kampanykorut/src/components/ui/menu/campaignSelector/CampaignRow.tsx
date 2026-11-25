import type { CampaignHeader } from "@logic/application";
import classNames from "classnames";
import { stripYearPrefix } from "../../gameplay/campaignBadge.utils";
import { CampaignChips, NewBadge } from "./CampaignChips";
import { isNewCampaign } from "./campaignSelector.utils";

interface CampaignRowProps {
  campaign: CampaignHeader;
  selected: boolean;
  compact?: boolean;
  onSelect: () => void;
  className?: string;
}

export function CampaignRow({
  campaign,
  selected,
  compact,
  onSelect,
  className,
}: CampaignRowProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      data-testid={campaign.id}
      onClick={onSelect}
      className={classNames(
        "flex w-full cursor-pointer items-center gap-4 rounded-md border text-left transition-colors duration-150 ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
        compact ? "px-4 py-3.5" : "px-5 py-4",
        selected
          ? "border-blue-400 bg-blue-400/12"
          : "border-blue-50/10 bg-blue-400/4 hover:bg-blue-400/8",
        className,
      )}
    >
      <span
        className={classNames(
          "shrink-0 font-bold tracking-tight text-blue-200",
          compact ? "w-14 text-xl" : "w-18 text-2xl",
        )}
      >
        {campaign.year || "–"}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="flex items-center gap-2">
          <span
            className={classNames(
              "font-semibold text-slate-50",
              compact ? "text-[15px] leading-[22px]" : "text-base",
            )}
          >
            {stripYearPrefix(campaign.label)}
          </span>
          {isNewCampaign(campaign) && <NewBadge />}
        </span>
        <CampaignChips campaign={campaign} />
      </span>
    </button>
  );
}
