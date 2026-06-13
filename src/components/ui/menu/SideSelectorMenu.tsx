import { t } from "i18next";
import { useLoaderData } from "react-router";
import { useCampaignBanner } from "../../../hooks/useCampaignBanner";
import { useSideSelectorMenu } from "../../../hooks/useSideSelectorMenu";
import { useGetCampaigns } from "../../../logic/application/hooks/useGetCampaigns";
import { Button } from "../Button";
import { CommonWrapper } from "../CommonWrapper";
import { Dropdown } from "../Dropdown";
import { Heading } from "../Heading";
import { Icon } from "../Icon";
import { Text } from "../Text";

export function SideSelectorMenu() {
  const { config, id } = useLoaderData();

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
  } = useSideSelectorMenu(config);

  const bannerImg = useCampaignBanner(id, true);
  const campaigns = useGetCampaigns();
  const currentCampaign = campaigns.find((c) => c.id === id) ?? null;

  return (
    <div className="h-[850px] w-[1200px] bg-slate-800 flex flex-col gap-6 p-4">
      <div className="relative">
        <div className="absolute bottom-0 w-[650px] p-2 z-10">
          <Heading color="white" level={3}>
            {currentCampaign?.label}
          </Heading>
          <Text>{currentCampaign?.description}</Text>
        </div>
        {bannerImg && (
          <CommonWrapper block>
            <img
              src={bannerImg}
              className="h-[200px] w-full object-cover rounded-m brightness-75"
            />
          </CommonWrapper>
        )}
      </div>
      <div className="flex justify-around w-full">
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
        />
      </div>
      <div className="w-full flex justify-between imtes-center">
        <Button variant="tertiary" size="large" onClick={goBack}>
          <Icon name="backspace-fill" />
          <Text weight="medium" color="lightBlue">
            {t("menuList.button.back")}
          </Text>
        </Button>
        <div className="flex justify-between w-[450px]">
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
  label: string;
  selectedElement?: string;
  handleOnChange: (id: string) => void;
  options: T[];
  avatar?: string;
  placeholderText: string;
  entityAsset: { label: string; description: string };
  disabled?: boolean;
  isPartySelector?: boolean;
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
}: SelectorItemProps<T>) {
  return (
    <CommonWrapper className="mr-4">
      <div className="w-[574px] box-border p-4 border-t-2 border-blue-400">
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
