import type { CampaignHeader } from "@logic/application";
import { Icon } from "@shared/ui/Icon";
import { t } from "i18next";
import { stripYearPrefix } from "../../gameplay/campaignBadge.utils";
import { campaignImageUrl } from "./campaignSelector.utils";

export function CampaignPreview({
  campaign,
}: {
  campaign: CampaignHeader | null;
}) {
  if (!campaign) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-md border border-dashed border-slate-400/35 bg-blue-400/4 p-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-blue-400/12 text-blue-200">
          <Icon name="display" color="currentColor" size="medium" />
        </span>
        <span className="flex max-w-90 flex-col gap-1.5">
          <span className="text-lg font-bold tracking-tight text-blue-50">
            {t("campaignSelector.emptyTitle")}
          </span>
          <span className="text-sm font-medium text-slate-400">
            {t("campaignSelector.emptyText")}
          </span>
        </span>
      </div>
    );
  }

  const banner = campaign.thinCampaignBanner ?? campaign.campaignBanner;

  return (
    <div
      data-testid="campaignPreview"
      className="absolute inset-0 flex flex-col overflow-hidden rounded-md border border-blue-50/10 bg-blue-400/6"
    >
      <img
        src={campaignImageUrl(campaign, banner)}
        alt={campaign.label}
        className="aspect-4/1 w-full shrink-0 object-cover"
      />
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-5 py-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-50">
          {campaign.year ? `${campaign.year}: ` : ""}
          {stripYearPrefix(campaign.label)}
        </h2>
        <p className="min-h-0 flex-1 overflow-y-auto pr-2 text-sm leading-[21px] font-medium text-slate-300">
          {campaign.description}
        </p>
      </div>
    </div>
  );
}
