import { Dropdown } from "../Dropdown";
import { Heading } from "../Heading";
import { Button } from "../Button";
import { Text } from "../Text";
import { Icon } from "../Icon";
import { useSideSelectorMenu } from "../../../hooks/useSideSelectorMenu";
import { useLoaderData } from "react-router";
import { t } from "i18next";

export function SideSelectorMenu() {
  const { config, id } = useLoaderData();

  const {
    gameConfig,
    sides,
    selectedParty,
    selectedCandidate,
    handleCandidateChange,
    handlePartyChange,
    startGame,
    candidateOptions,
    goBack,
  } = useSideSelectorMenu(config);

  const partyAssets = selectedParty
    ? gameConfig?.electionAssets[selectedParty.id]
    : undefined;
  const candidatePortrait =
    selectedCandidate && partyAssets
      ? partyAssets.portrait?.[selectedCandidate]
      : undefined;

  return (
    <div className="h-[850px] w-[1200px] bg-slate-800 p-6 flex flex-col gap-6">
      <div className="flex justify-around w-full">
        <div>
          <Heading level={3} className="mb-2">
            {t("sideSelector.party.label")}
          </Heading>
          <Dropdown
            value={selectedParty?.id}
            onChange={handlePartyChange}
            options={sides.map((side) => ({
              label: side.name,
              value: side.id,
            }))}
            placeholder={t("sideSelector.party.dropdown")}
          />
          <div className="h-70 border bg-gray-700 border-slate-600 rounded overflow-hidden mt-4">
            {partyAssets && (
              <img
                src={partyAssets.party_logo}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
        <div>
          <Heading level={3} className="mb-2">
            {t("sideSelector.candidate.label")}
          </Heading>
          <Dropdown<string>
            value={selectedCandidate}
            onChange={(e) => handleCandidateChange(selectedParty?.id ?? "", e)}
            options={candidateOptions}
            disabled={!selectedParty}
            placeholder={t("sideSelector.candidate.dropdown")}
          />
          <div className="h-70 w-[256px] border bg-gray-700 border-slate-600 rounded overflow-hidden mt-4">
            {candidatePortrait && (
              <img
                src={candidatePortrait}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
      <div className="w-full flex justify-between">
        <Button variant="tertiary" size="large" onClick={goBack}>
          <Icon name="backspace-fill" />
          <Text weight="medium" color="lightBlue">
            {t("menuList.button.back")}
          </Text>
        </Button>
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
