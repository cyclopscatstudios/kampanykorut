import { Dropdown } from "../Dropdown";
import { Heading } from "../Heading";
import { Button } from "../Button";
import { type MenuItem } from "./menu.types";
import { Text } from "../Text";
import { Icon } from "../Icon";
import { useSideSelectorMenu } from "../../../hooks/useSideSelectorMenu";

interface SideSelectorMenuProps {
  gameId?: string;
  onClick: (item: MenuItem) => void;
}

export function SideSelectorMenu({ onClick, gameId }: SideSelectorMenuProps) {
  const {
    gameConfig,
    sides,
    selectedParty,
    selectedCandidate,
    setSelectedCandidate,
    handlePartyChange,
    goBack,
    startGame,
    candidateOptions,
  } = useSideSelectorMenu(gameId, onClick);

  

  const partyAssets = selectedParty
    ? gameConfig?.electionAssets[selectedParty.id]
    : undefined;

  const candidatePortrait =
    selectedCandidate && partyAssets
      ? partyAssets.portrait[selectedCandidate]
      : undefined;

  return (
    <div className="h-[850px] w-[1200px] bg-slate-800 p-6 flex flex-col gap-6">
      <div className="flex justify-around w-full">
        <div>
          <Heading level={3} className="mb-2">
            Select a party
          </Heading>
          <Dropdown
            value={selectedParty?.id}
            onChange={handlePartyChange}
            options={sides.map((side) => ({
              label: side.name,
              value: side.id,
            }))}
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
            Select a candidate
          </Heading>
          <Dropdown<string>
            value={selectedCandidate}
            onChange={setSelectedCandidate}
            options={candidateOptions}
            disabled={!selectedParty}
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
      <Button
        className="mt-auto"
        disabled={!selectedCandidate}
        onClick={startGame}
      >
        <Button.Text>Start Game</Button.Text>
      </Button>
      <Button variant="tertiary" size="large" block onClick={goBack}>
        <Icon name="backspace-fill" />
        <Text weight="medium" color="lightBlue">
          back
        </Text>
      </Button>
    </div>
  );
}
