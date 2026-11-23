import {
  type CampaignHeader,
  isCampaignListed,
  StateEngine,
  StorageEngine,
  useGetCampaigns,
  useStateEngine,
} from "@logic/application";
import { Button } from "@shared/ui/Button";
import { MenuLayout } from "@shared/ui/menu/MenuLayout";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { container } from "tsyringe";
import { useMediaQuery } from "usehooks-ts";
import { useNavigation } from "../../../hooks/navigationHook";
import { CampaignPreview } from "./campaignSelector/CampaignPreview";
import { CampaignRow } from "./campaignSelector/CampaignRow";
import {
  campaignImageUrl,
  type CampaignSort,
  sortCampaigns,
} from "./campaignSelector/campaignSelector.utils";
import { SortMenu } from "./campaignSelector/SortMenu";

export function ClassicModeSelectorMenu() {
  const campaigns = useGetCampaigns();
  const storage = container.resolve(StorageEngine);
  const debugMode = storage.getItem("debugMode", "localStorage") ?? "false";
  const enabled = JSON.parse(debugMode);

  return (
    <MenuLayout>
      <CampaignSelectorMenuList
        campaignHeaders={campaigns.filter((campaign) =>
          isCampaignListed(campaign, enabled),
        )}
      />
    </MenuLayout>
  );
}

interface CampaignSelectorMenuListProps {
  campaignHeaders: CampaignHeader[];
}

export function CampaignSelectorMenuList({
  campaignHeaders,
}: CampaignSelectorMenuListProps) {
  const { saveSession } = useStateEngine();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<CampaignSort>("year");
  const { goBack, goToSideSelector } = useNavigation();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    container.resolve(StateEngine).startNewSession();
  }, []);

  const sorted = sortCampaigns(campaignHeaders, sort);
  const selected = sorted.find((c) => c.id === selectedId) ?? null;

  const select = (campaign: CampaignHeader) => {
    setSelectedId(campaign.id);
    saveSession("campaignState", { activeCampaignId: campaign.id });
  };

  const countLabel = t("campaignSelector.count", {
    count: campaignHeaders.length,
  });

  const backButton = (
    <Button
      variant="tertiary"
      size="large"
      block={!isDesktop}
      className={isDesktop ? "w-60" : undefined}
      onClick={goBack}
    >
      <Button.Icon name="backspace-fill" />
      <Button.Text>{t("menuList.button.back")}</Button.Text>
    </Button>
  );

  const nextButton = (
    <Button
      variant="primary"
      size="large"
      block={!isDesktop}
      className={isDesktop ? "w-60" : undefined}
      disabled={!selected}
      testId="campaignNext"
      onClick={() => selected && goToSideSelector(selected.id)}
    >
      <Button.Text>{t("menuList.button.next")}</Button.Text>
    </Button>
  );

  if (!isDesktop) {
    return (
      <div className="relative flex size-full flex-col bg-slate-900/92 text-slate-50">
        <div className="flex flex-col gap-1 px-4 pt-8 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-blue-50">
            {t("gameSelectorMenhu.label")}
          </h1>
          <div className="relative z-5 mt-2 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-400">{countLabel}</p>
            <SortMenu value={sort} onChange={setSort} />
          </div>
          {!selected && (
            <p className="mt-2 text-sm font-medium text-slate-300">
              {t("campaignSelector.mobileHint")}
            </p>
          )}
        </div>
        <div
          role="listbox"
          aria-label={t("gameSelectorMenhu.label")}
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pt-0.5 pb-4"
        >
          {sorted.map((campaign) => {
            const isSelected = campaign.id === selected?.id;
            return (
              <div key={campaign.id} className="flex flex-col">
                <CampaignRow
                  campaign={campaign}
                  selected={isSelected}
                  compact
                  onSelect={() => select(campaign)}
                  className={isSelected ? "rounded-b-none" : undefined}
                />
                {isSelected && (
                  <div className="flex flex-col gap-2.5 rounded-b-md border border-t-0 border-blue-400 bg-blue-400/6 p-3">
                    <img
                      src={campaignImageUrl(campaign, campaign.campaignBanner)}
                      alt={campaign.label}
                      className="aspect-video w-full rounded-md object-cover"
                    />
                    <p className="max-h-[126px] overflow-y-auto pr-1.5 text-[13px] leading-[21px] font-medium text-slate-300">
                      {campaign.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-blue-50/10 bg-slate-900/96 px-4 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]">
          {backButton}
          {nextButton}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[1104px] flex-col justify-center gap-7 px-12 text-slate-50">
      <h1 className="text-3xl font-bold tracking-tight text-blue-50">
        {t("gameSelectorMenhu.label")}
      </h1>
      <div className="grid grid-cols-[500px_minmax(0,1fr)] gap-x-8 gap-y-3">
        <div className="relative z-5 flex items-center justify-between gap-3 pr-2 pl-0.5">
          <p className="text-sm text-slate-400">{countLabel}</p>
          <SortMenu value={sort} onChange={setSort} />
        </div>
        <div />
        <div
          role="listbox"
          aria-label={t("gameSelectorMenhu.label")}
          className="flex max-h-[400px] flex-col gap-2 overflow-y-auto py-0.5 pr-2 pl-0.5"
        >
          {sorted.map((campaign) => (
            <CampaignRow
              key={campaign.id}
              campaign={campaign}
              selected={campaign.id === selected?.id}
              onSelect={() => select(campaign)}
            />
          ))}
        </div>
        <div className="relative min-h-[400px] min-w-0">
          <CampaignPreview campaign={selected} />
        </div>
      </div>
      <div className="flex justify-center gap-6">
        {backButton}
        {nextButton}
      </div>
    </div>
  );
}
