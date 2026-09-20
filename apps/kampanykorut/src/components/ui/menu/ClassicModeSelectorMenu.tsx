import classNames from "classnames";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { container } from "tsyringe";
import { useMediaQuery } from "usehooks-ts";
import {
  type CampaignHeader,
  StorageEngine,
  useGetCampaigns,
  useStateEngine,
} from "@/logic/application";
import { useTranslateLang } from "../../../../../../shared/logic/hooks/useTranslateLang";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { MenuLayout } from "../../../../../../shared/ui/menu/MenuLayout";
import { Text } from "../../../../../../shared/ui/Text";
import { useNavigation } from "../../../hooks/navigationHook";
import { Dropdown } from "../Dropdown";
import { Heading } from "../Heading";

export function ClassicModeSelectorMenu() {
  const campaigns = useGetCampaigns();
  const storage = container.resolve(StorageEngine);
  const debugMode = storage.getItem("debugMode", "localStorage") ?? "false";
  const enabled = JSON.parse(debugMode);
  const filtered = !enabled
    ? campaigns.filter((camapign) => camapign.isPublished)
    : campaigns;

  return (
    <MenuLayout>
      <CampaignSelectorMenuList campaignHeaders={filtered.sort((a, b) => b.year - a.year)} />
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
  const [selectedCampaign, setSelectedCampaign] =
    useState<CampaignHeader | null>(null);
  const backButton = useTranslateLang("menuList.button.back");
  const { goBack, goToSideSelector } = useNavigation();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    saveSession("campaignState", null);
  }, [saveSession]);

  return (
    <div className="size-full flex items-center justify-center px-2">
      <div className="flex flex-col items-center justify-center gap-6 w-112.5">
        <Heading level={3} color="lightBlue">
          {selectedCampaign
            ? selectedCampaign.label
            : t("gameSelectorMenhu.label")}
        </Heading>
        <Dropdown
          options={campaignHeaders.map((campaign) => ({
            label: campaign.label,
            value: campaign.id,
          }))}
          onChange={(id) => {
            const found = campaignHeaders.find((c) => c.id === id) ?? null;
            setSelectedCampaign(found);
            if (found)
              saveSession("campaignState", { activeCampaignId: found.id });
          }}
          placeholder={t("gameSelectorMenhu.placeholder")}
        />
        {selectedCampaign && (
          <div className="flex w-full gap-4 rounded-md border border-blue-500/40 p-3">
            <img
              src={`/images/${selectedCampaign.route}/${selectedCampaign.campaignBanner}`}
              alt={selectedCampaign.label}
              className="h-32 w-32 shrink-0 rounded-md object-cover"
            />
            {selectedCampaign.description && (
              <Text
                weight="medium"
                color="lightBlue"
                className="max-h-32 overflow-y-auto pr-2 text-xs"
              >
                {selectedCampaign.description}
              </Text>
            )}
          </div>
        )}
        <div
          className={classNames("flex w-full gap-2", {
            "flex-col-reverse px-2": !isDesktop,
          })}
        >
          <Button variant="tertiary" size="large" block onClick={goBack}>
            <Icon name="backspace-fill" />
            <Text weight="medium" color="lightBlue">
              {backButton}
            </Text>
          </Button>
          <Button
            variant="primary"
            size="large"
            block
            disabled={!selectedCampaign}
            onClick={() => goToSideSelector(selectedCampaign?.id ?? "")}
          >
            <Button.Text>{t("menuList.button.next")}</Button.Text>
          </Button>
        </div>
      </div>
    </div>
  );
}
