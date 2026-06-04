import { t } from "i18next";
import { useEffect, useState } from "react";
import { useNavigation } from "../../../hooks/navigationHook";
import {
  type CampaignHeader,
  useGetCampaigns,
} from "../../../logic/application/hooks/useGetCampaigns";
import { useTranslateLang } from "../../../logic/useTranslateLang";
import { Button } from "../Button";
import { Dropdown } from "../Dropdown";
import { Heading } from "../Heading";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { MenuLayout } from "./MenuLayout";
import { useStateEngine } from "@/logic/application";

export function ClassicModeSelectorMenu() {
  const campaigns = useGetCampaigns();

  return (
    <MenuLayout>
      <CampaignSelectorMenuList campaignHeaders={campaigns} />
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

  useEffect(() => {
    saveSession("campaignState", null);
  }, [saveSession]);

  return (
    <div className="size-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-6 w-87.5">
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
        />

        {selectedCampaign && (
          <div className="w-full overflow-hidden rounded-md border border-blue-500/40">
            <img
              src={`/images/${selectedCampaign.route}/${selectedCampaign.campaignBanner}`}
              alt={selectedCampaign.label}
              className="h-auto w-full object-cover"
            />
            {selectedCampaign.description && (
              <Text
                weight="medium"
                color="lightBlue"
                className="px-3 py-2 text-xs"
              >
                {selectedCampaign.description}
              </Text>
            )}
          </div>
        )}

        <div className="flex w-full flex-col gap-2">
          <Button
            variant="primary"
            size="large"
            block
            disabled={!selectedCampaign}
            onClick={() => goToSideSelector(selectedCampaign?.id ?? "")}
          >
            <Button.Text>{t("menuList.button.next")}</Button.Text>
          </Button>
          <Button variant="tertiary" size="large" block onClick={goBack}>
            <Icon name="backspace-fill" />
            <Text weight="medium" color="lightBlue">
              {backButton}
            </Text>
          </Button>
        </div>
      </div>
    </div>
  );
}
