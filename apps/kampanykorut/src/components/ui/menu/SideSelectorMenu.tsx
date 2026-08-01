import classNames from "classnames";
import { t } from "i18next";
import { useLoaderData } from "react-router";
import { useMediaQuery } from "usehooks-ts";
import { CampaignConfig } from "@/shared/types/configs";
import {
  Candidate,
  PlayableSide,
} from "@/shared/types/configs/election-config";
import { useCampaignBanner } from "../../../hooks/useCampaignBanner";
import { useSideSelectorMenu } from "../../../hooks/useSideSelectorMenu";
import { useGetCampaigns } from "../../../logic/application/hooks/useGetCampaigns";
import { Button } from "../../../../../../shared/ui/Button";
import { CommonWrapper } from "../CommonWrapper";
import { Dropdown } from "../Dropdown";
import { Heading } from "../Heading";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import { Tooltip } from "../Tooltip";

export function SideSelectorMenu() {
  const { id } = useLoaderData();

  const {
    selectedParty,
    selectedCandidate,
    playableSides,
    handleCandidateChange,
    handlePartyChange,
    startGame,
    candidateOptions,
    goBack,
    assets,
    campaignConfig,
  } = useSideSelectorMenu(id);

  const bannerImg = useCampaignBanner(id, true);
  const campaigns = useGetCampaigns();
  const currentCampaign = campaigns.find((c) => c.id === id) ?? null;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="size-full md:h-[750px] md:w-[1200px] bg-slate-800 flex flex-col gap-6 p-4">
      <div className="relative">
        <div className="absolute bottom-0 w-[650px] p-2 z-10">
          <Heading color="white" level={3}>
            {currentCampaign?.label}
          </Heading>
        </div>
        <div className="absolute bottom-0 right-0 w-[500px] p-2 z-10 flex flex-col gap-2 items-end">
          {isDesktop && (
            <BadgeDisplay
              config={campaignConfig}
              party={selectedParty}
              candidate={selectedCandidate}
            />
          )}
        </div>
        {bannerImg && (
          <CommonWrapper block>
            <img
              src={bannerImg}
              className="h-[100px] md:h-[200px] w-full object-cover rounded-m brightness-75"
            />
          </CommonWrapper>
        )}
      </div>
      <div
        className={classNames(
          "flex flex-col md:flex-row justify-around w-full",
          {
            "h-full gap-2": !isDesktop,
          },
        )}
      >
        <SelectorItem
          label={t("sideSelector.party.label")}
          entityAsset={{
            label: selectedParty?.label ?? "",
            description: selectedParty?.description ?? "",
          }}
          selectedElement={selectedParty?.id}
          placeholderText={t("sideSelector.party.emptyState")}
          options={playableSides}
          handleOnChange={handlePartyChange}
          avatar={assets.partyAssets?.party_logo}
          isPartySelector
          testId="partySelector"
        />
        <SelectorItem
          label={t("sideSelector.candidate.label")}
          selectedElement={selectedCandidate?.id}
          placeholderText={t("sideSelector.candidate.emptyState")}
          options={candidateOptions}
          handleOnChange={handleCandidateChange}
          avatar={assets.candidateAsset?.portrait}
          entityAsset={{
            label: selectedCandidate?.label ?? "",
            description: selectedCandidate?.description ?? "",
          }}
          disabled={!selectedParty}
          testId="candidateSelector"
        />
      </div>
      <div
        className={classNames(
          "w-full flex flex-col-reverse md:flex-row justify-between imtes-center",
          {
            "mt-auto gap-2": !isDesktop,
          },
        )}
      >
        <Button
          variant="tertiary"
          size="large"
          onClick={goBack}
          block={!isDesktop}
        >
          <Icon name="backspace-fill" />
          <Text weight="medium" color="lightBlue">
            {t("menuList.button.back")}
          </Text>
        </Button>
        {isDesktop && (
          <div className="flex justify-between items-center w-[450px]">
            {selectedParty && (
              <div className="flex">
                <Icon name="check-circle" color="green" className="mr-2" />
                <Text weight="medium">{selectedParty?.label}</Text>
              </div>
            )}
            {selectedCandidate && (
              <div className="flex">
                <Icon name="check-circle" color="green" className="mr-2" />
                <Text weight="medium">{selectedCandidate?.label}</Text>
              </div>
            )}
          </div>
        )}
        <Button
          variant="primary"
          size="large"
          disabled={!selectedCandidate}
          onClick={() => startGame(id)}
          block={!isDesktop}
        >
          <Button.Text>{t("menuList.button.start")}</Button.Text>
        </Button>
      </div>
    </div>
  );
}

interface SelectorItemProps<T extends { label: string; value: string }> {
  label: string;
  selectedElement?: string;
  handleOnChange: (id: string) => void;
  options: T[];
  avatar?: string;
  placeholderText: string;
  entityAsset: { label: string; description: string };
  disabled?: boolean;
  isPartySelector?: boolean;
  testId?: string;
}

function SelectorItem<T extends { label: string; value: string }>({
  label,
  selectedElement,
  handleOnChange,
  options,
  avatar: asset,
  placeholderText,
  entityAsset,
  disabled,
  isPartySelector,
  testId,
}: SelectorItemProps<T>) {
  return (
    <CommonWrapper className="md:mr-4">
      <div className="md:w-[574px] box-border p-4 border-t-2 border-blue-400">
        <div className="flex items-baseline">
          <Text size="xs" className="mr-2" color="gray">
            {isPartySelector ? "2.1" : "2.2"}
          </Text>
          <Heading level={5} className="mb-2" color="white">
            {label}
          </Heading>
        </div>
        <Dropdown
          value={selectedElement}
          onChange={handleOnChange}
          options={options.map((item) => ({
            label: item.label,
            value: item.value,
          }))}
          placeholder={t("sideSelector.party.dropdown")}
          block
          disabled={disabled}
          id={testId}
        />
        {selectedElement ? (
          <div className="hidden md:flex">
            <div className="h-70 w-[200px] border bg-gray-700 border-slate-600 rounded overflow-hidden mt-4">
              {asset && (
                <img src={asset} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="w-[350px] p-4">
              <Heading level={5} color="white" className="mb-2">
                {entityAsset?.label}
              </Heading>
              <Text size="sm">{entityAsset?.description}</Text>
            </div>
          </div>
        ) : (
          <div className="hidden md:block h-70 w-full border border-dashed bg-gray-800/50 border-slate-400 rounded overflow-hidden mt-4">
            <div className="w-full h-full flex justify-center items-center">
              <div className="w-[450px]">
                <Text size="sm" color="gray">
                  {placeholderText}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>
    </CommonWrapper>
  );
}

function BadgeDisplay({
  config,
  party,
  candidate,
}: {
  config: CampaignConfig;
  party?: PlayableSide;
  candidate?: Candidate;
}) {
  const badges = getBadgesForTarget(config, party, candidate);

  return (
    <Tooltip
      content={t("translation:sideSelector.badgeDisplay.tooltipContent")}
    >
      <div className="bg-slate-800/40 rounded-lg p-5 backdrop-blur-sm border border-blue-50/30">
        <div className="flex items-center mb-2">
          <Icon name="info-circle" size="xs" className="mr-1" />
          <Text size="xs">{t("sideSelector.badgeDisplay.label")}</Text>
        </div>
        <div className="flex flex-row gap-2 justify-center">
          {badges?.map((badge) => (
            <Tooltip content={badge.label} key={badge.id}>
              <div>
                <img
                  key={badge.id}
                  src={badge.asset?.badge}
                  alt={badge.label}
                  className="w-12 h-12"
                />
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    </Tooltip>
  );
}

function getBadgesForTarget(
  config: CampaignConfig,
  party?: PlayableSide,
  candidate?: Candidate,
) {
  const strategies = config.playableSides?.[party?.id ?? ""]?.[
    candidate?.id ?? ""
  ]?.campaignStrategies?.filter(
    (s) => s.target.party === party?.id && s.target.candidate === candidate?.id,
  );
  return strategies;
}
