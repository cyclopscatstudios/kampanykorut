import classNames from "classnames";
import { t } from "i18next";
import { useLayoutEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router";
import { useMediaQuery } from "usehooks-ts";
import { CampaignConfig } from "@/shared/types/configs";
import {
  Candidate,
  PlayableSide,
} from "@/shared/types/configs/election-config";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import { Tooltip } from "../../../../../../shared/ui/Tooltip";
import { useCampaignBanner } from "../../../hooks/useCampaignBanner";
import { useSideSelectorMenu } from "../../../hooks/useSideSelectorMenu";
import { useGetCampaigns } from "../../../logic/application/hooks/useGetCampaigns";
import { BottomSheet } from "../BottomSheet";
import { CommonWrapper } from "../CommonWrapper";
import { Dropdown } from "../Dropdown";
import { Heading } from "../Heading";

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
  const [isBadgeSheetOpen, setIsBadgeSheetOpen] = useState(false);

  const partyImage = (partyId: string) =>
    campaignConfig.electionConfig.electionAssets.find((a) => a.id === partyId)
      ?.party_logo;
  const candidateImage = (candidateId: string) =>
    assets.partyAssets?.candidateAssets.find((a) => a.id === candidateId)
      ?.portrait;

  const partySelector = (
    <SelectorItem
      isDesktop={isDesktop}
      label={t("sideSelector.party.label")}
      entityAsset={{
        label: selectedParty?.label ?? "",
        description: selectedParty?.description ?? "",
      }}
      selectedElement={selectedParty?.id}
      placeholderText={t("sideSelector.party.emptyState")}
      pickerPlaceholder={t("sideSelector.party.dropdown")}
      options={playableSides}
      handleOnChange={handlePartyChange}
      avatar={assets.partyAssets?.party_logo}
      optionImage={partyImage}
      isPartySelector
      testId="partySelector"
    />
  );

  const candidateSelector = (
    <SelectorItem
      isDesktop={isDesktop}
      label={t("sideSelector.candidate.label")}
      selectedElement={selectedCandidate?.id}
      placeholderText={t("sideSelector.candidate.emptyState")}
      pickerPlaceholder={t("sideSelector.candidate.dropdown")}
      options={candidateOptions}
      handleOnChange={handleCandidateChange}
      avatar={assets.candidateAsset?.portrait}
      optionImage={candidateImage}
      entityAsset={{
        label: selectedCandidate?.label ?? "",
        description: selectedCandidate?.description ?? "",
      }}
      disabled={!selectedParty}
      testId="candidateSelector"
    />
  );

  if (!isDesktop) {
    const badges =
      getBadgesForTarget(campaignConfig, selectedParty, selectedCandidate) ??
      [];
    const selectedLabels = [selectedParty?.label, selectedCandidate?.label]
      .filter(Boolean)
      .map(String);

    return (
      <div className="relative size-full flex flex-col bg-[#0d1830]/90">
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Button variant="tertiary" size="sm" onClick={goBack}>
              <Button.Icon name="chevron-left" />
              <Button.Text>{t("menuList.button.back")}</Button.Text>
            </Button>
            <Text
              as="span"
              size="xs"
              weight="bold"
              color="gray"
              className="uppercase tracking-[1.2px]"
            >
              {t("mainMenu.newGame")}
            </Text>
          </div>

          <div className="relative h-28 shrink-0 overflow-hidden rounded-xl border border-slate-400/15">
            {bannerImg && (
              <img src={bannerImg} alt="" className="size-full object-cover" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent to-60%" />
            <div className="absolute left-3 right-3 bottom-2.5 text-xl font-extrabold tracking-[-0.4px] text-white">
              {currentCampaign?.label}
            </div>
            {badges.length > 0 && (
              <button
                type="button"
                onClick={() => setIsBadgeSheetOpen(true)}
                className="absolute top-2 right-2 h-[30px] px-2.5 rounded-lg border border-white/20 bg-[rgba(10,18,36,0.7)] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="info-circle" size="xs" />
                {t("sideSelector.badgeDisplay.short")} · {badges.length}
              </button>
            )}
          </div>

          {partySelector}
          {candidateSelector}
        </div>

        <div className="shrink-0 border-t border-slate-400/15 bg-[#0d1830]/90 backdrop-blur-md px-3.5 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] flex flex-col gap-2">
          {selectedLabels.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-3.5 gap-y-1">
              {selectedLabels.map((label) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-300"
                >
                  <Icon name="check-circle" color="green" size="xs" />
                  {label}
                </span>
              ))}
            </div>
          )}
          <Button
            variant="primary"
            size="large"
            block
            disabled={!selectedCandidate}
            onClick={() => startGame(id)}
          >
            <Button.Text>{t("menuList.button.start")}</Button.Text>
          </Button>
        </div>

        <BottomSheet
          open={isBadgeSheetOpen}
          title={t("sideSelector.badgeDisplay.label")}
          onClose={() => setIsBadgeSheetOpen(false)}
        >
          <div className="flex flex-col gap-2.5">
            {badges.map((badge) => (
              <div key={badge.id} className="flex items-center gap-3">
                <img
                  src={badge.asset?.badge}
                  alt=""
                  className="size-11 shrink-0"
                />
                <Text size="sm" weight="bold">
                  {badge.label}
                </Text>
              </div>
            ))}
          </div>
        </BottomSheet>
      </div>
    );
  }

  return (
    <div className="size-full md:h-[750px] md:w-[1200px] bg-slate-800 flex flex-col gap-6 p-4">
      <div className="relative">
        <div className="absolute bottom-0 w-full md:w-[650px] p-2 z-10">
          <Heading color="white" level={3}>
            {currentCampaign?.label}
          </Heading>
        </div>
        <div className="flex absolute bottom-0 right-0 w-[500px] p-2 z-10 flex-col gap-2 items-end">
          <BadgeDisplay
            config={campaignConfig}
            party={selectedParty}
            candidate={selectedCandidate}
          />
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
      <div className="flex flex-row justify-around w-full">
        {partySelector}
        {candidateSelector}
      </div>
      <div className="w-full flex flex-row justify-between items-center">
        <Button variant="tertiary" size="large" onClick={goBack}>
          <Icon name="backspace-fill" />
          <Text weight="medium" color="lightBlue">
            {t("menuList.button.back")}
          </Text>
        </Button>
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
        <Button
          variant="primary"
          size="large"
          disabled={!selectedCandidate}
          onClick={() => startGame(id)}
        >
          <Button.Text>{t("menuList.button.start")}</Button.Text>
        </Button>
      </div>
    </div>
  );
}

interface SelectorItemProps<T extends { label: string; value: string }> {
  isDesktop: boolean;
  label: string;
  selectedElement?: string;
  handleOnChange: (id: string) => void;
  options: T[];
  avatar?: string;
  optionImage: (id: string) => string | undefined;
  placeholderText: string;
  pickerPlaceholder: string;
  entityAsset: { label: string; description: string };
  disabled?: boolean;
  isPartySelector?: boolean;
  testId?: string;
}

function SelectorItem<T extends { label: string; value: string }>({
  isDesktop,
  label,
  selectedElement,
  handleOnChange,
  options,
  avatar: asset,
  optionImage,
  placeholderText,
  pickerPlaceholder,
  entityAsset,
  disabled,
  isPartySelector,
  testId,
}: SelectorItemProps<T>) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const step = isPartySelector ? "2.1" : "2.2";

  if (!isDesktop) {
    const selectedLabel = options.find(
      (o) => o.value === selectedElement,
    )?.label;

    return (
      <div className="rounded-xl border border-slate-400/15 border-t-2 border-t-blue-500 bg-[#1b2b49] p-3.5 flex flex-col gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10.5px] font-semibold text-slate-500">
            {step}
          </span>
          <span className="text-[17px] font-extrabold tracking-[-0.3px] text-slate-50">
            {label}
          </span>
        </div>
        <button
          type="button"
          data-testid={testId}
          disabled={disabled}
          onClick={() => setIsSheetOpen(true)}
          className="h-[46px] w-full rounded-[10px] border border-slate-400/15 bg-slate-400/6 px-3.5 flex items-center justify-between gap-2 text-left text-[13.5px] font-bold text-slate-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="truncate">{selectedLabel ?? pickerPlaceholder}</span>
          <Icon name="chevron-down" size="xs" color="gray" />
        </button>
        {selectedElement ? (
          <SelectionDetail
            key={selectedElement}
            image={asset}
            contain={isPartySelector}
            label={entityAsset.label}
            description={entityAsset.description}
          />
        ) : (
          <Text size="xs" color="gray">
            {placeholderText}
          </Text>
        )}
        <BottomSheet
          open={isSheetOpen}
          title={label}
          onClose={() => setIsSheetOpen(false)}
        >
          <div className="flex flex-col gap-2">
            {options.map((option) => {
              const isSelected = option.value === selectedElement;
              return (
                <button
                  key={option.value}
                  type="button"
                  data-testid={option.value}
                  onClick={() => {
                    handleOnChange(option.value);
                    setIsSheetOpen(false);
                  }}
                  className={classNames(
                    "flex items-center gap-3 rounded-xl border-[1.5px] p-2.5 text-left text-sm font-bold text-slate-50 cursor-pointer",
                    isSelected
                      ? "border-blue-500 bg-blue-500/16"
                      : "border-slate-400/15 bg-slate-400/5",
                  )}
                >
                  <Thumb
                    src={optionImage(option.value)}
                    contain={isPartySelector}
                    className="size-11 rounded-lg"
                  />
                  {option.label}
                </button>
              );
            })}
          </div>
        </BottomSheet>
      </div>
    );
  }

  return (
    <CommonWrapper className="md:mr-4">
      <div className="md:w-[574px] box-border p-4 border-t-2 border-blue-400">
        <div className="flex items-baseline">
          <Text size="xs" className="mr-2" color="gray">
            {step}
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
          <div className="flex">
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
          <div className="h-70 w-full border border-dashed bg-gray-800/50 border-slate-400 rounded overflow-hidden mt-4">
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

function SelectionDetail({
  image,
  contain,
  label,
  description,
}: {
  image?: string;
  contain?: boolean;
  label: string;
  description: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = descriptionRef.current;
    if (el && !isExpanded) {
      setIsClamped(el.scrollHeight > el.clientHeight + 1);
    }
  }, [description, isExpanded]);

  return (
    <div className="flex items-start gap-3">
      <Thumb src={image} contain={contain} className="size-17 rounded-[10px]" />
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-extrabold tracking-[-0.2px] text-slate-50">
          {label}
        </div>
        <p
          ref={descriptionRef}
          className={classNames(
            "mt-1 text-xs leading-normal text-slate-300 text-pretty",
            { "line-clamp-3": !isExpanded },
          )}
        >
          {description}
        </p>
        {(isClamped || isExpanded) && (
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="mt-1 text-[11.5px] font-bold text-[#8fb0ee] cursor-pointer"
          >
            {t(isExpanded ? "sideSelector.showLess" : "sideSelector.showMore")}
          </button>
        )}
      </div>
    </div>
  );
}

function Thumb({
  src,
  contain,
  className,
}: {
  src?: string;
  contain?: boolean;
  className: string;
}) {
  return (
    <div
      className={classNames(
        "shrink-0 overflow-hidden border border-slate-400/15",
        contain ? "bg-white" : "bg-[#0b1222]",
        className,
      )}
    >
      {src && (
        <img
          src={src}
          alt=""
          className={classNames(
            "block size-full",
            contain ? "object-contain p-1.5" : "object-cover",
          )}
        />
      )}
    </div>
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
    <div className="bg-slate-800/40 rounded-lg p-5 backdrop-blur-sm border border-blue-50/30">
      <div className="flex items-center mb-2">
        <Tooltip
          content={t("translation:sideSelector.badgeDisplay.tooltipContent")}
        >
          <Icon name="info-circle" size="xs" className="mr-1" />
        </Tooltip>
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
