import type {
  CampaignState,
  CandidateListData,
  FinalResults,
} from "@/logic/domain";
import { Text } from "../../../Text";
import { useMemo, useState } from "react";
import { Button } from "../../../Button";
import {
  calculateVotePercentages,
  getPartyById,
  type VotePercentage,
} from "../electionMap.utils";
import { AdvancedProgressBar, ProgressBar } from "./ProgressBar";
import type { CampaignConfig } from "../../../../../logic/types/campaignEngine.types";
import classNames from "classnames";
import { Badge } from "../../../Badge";
interface DistrictDetailsProps {
  state: CampaignState | null;
  results: FinalResults;
  config: CampaignConfig;
}

type CountyGroup = {
  megyekod: number;
  megye: string;
  districts: CandidateListData[];
};

export function DistrictDetails({ state, config }: DistrictDetailsProps) {
  const [selectedCounty, setSelectedCounty] = useState<number | null>(null);

  const districts = state?.candidateListData ?? [];

  const counties = useMemo(() => groupByCounty(districts), [districts]);

  const selectedCountyDistricts = useMemo(
    () =>
      selectedCounty === null
        ? []
        : districts.filter((d) => d.megyekod === selectedCounty),
    [districts, selectedCounty],
  );

  return (
    <div className="flex w-full gap-2">
      <div className="max-h-[500px] w-[350px] overflow-y-auto pr-2">
        {counties.map((county) => (
          <Button
            key={county.megyekod}
            selected={selectedCounty === county.megyekod}
            size="lg"
            variant="tertiary"
            block
            className="mb-2"
            onClick={() => setSelectedCounty(county.megyekod)}
          >
            {county.megye} {county.megyekod}
          </Button>
        ))}
      </div>

      <div className="w-[750px] max-h-[500px] overflow-y-auto p-2">
        {selectedCountyDistricts.map((district) => (
          <DistrictCard
            key={`${district.megyekod}-${district.oevk}`}
            district={district}
            config={config}
          />
        ))}
      </div>
    </div>
  );
}

interface DistrictCardProps {
  district: CandidateListData;
  config: CampaignConfig;
}

function DistrictCard({ district, config }: DistrictCardProps) {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const votePercentage = useMemo(() => {
    const percentages = calculateVotePercentages(district.partok);

    return Object.fromEntries(
      Object.entries(percentages ?? {})
        .sort(([, a], [, b]) => (b.votes ?? 0) - (a.votes ?? 0))
        .map(([party, data]) => [
          party,
          {
            ...data,
            color: getPartyColor(party, config),
          },
        ]),
    );
  }, [district.partok, config]);

  const turnout = getPartyVotesTurnoutPercentage(district);

  const leadingPartyColor =
    Object.values(votePercentage)[0]?.color ?? "#000000";

  const winnerPartyId = Object.entries(votePercentage).find(
    ([, data]) => data.isWinner,
  )?.[0];

  const partyName =
    getPartyById(winnerPartyId ?? "", config)?.name ?? "Független";

  return (
    <div
      className="bg-blue-400/10 rounded-md border border-blue-50/10 p-4 mb-4"
      style={{
        borderLeft: `4px solid ${leadingPartyColor}`,
      }}
    >
      <div className="flex justify-between mb-2">
        <div className="flex">
          <Text weight="bold" size="lg" className="mr-2">
            {district.megye} {district.oevk}
          </Text>
          <Text color="blue">{district.telepules}</Text>
        </div>
        <div>
          <Text>Turnout: {turnout.toFixed(1)}%</Text>
          <Badge label={partyName} customColor={leadingPartyColor} />
        </div>
      </div>
      <AdvancedProgressBar votePercentage={votePercentage} />
      <div className="mt-2">
        {Object.entries(votePercentage).map(([party, data], index) => {
          return (
            <PartyDetails
              key={party}
              partyId={party}
              data={data}
              config={config}
              index={index}
              selectedParty={selectedParty}
              setSelectedParty={setSelectedParty}
            />
          );
        })}
      </div>
    </div>
  );
}

function getPartyVotesTurnoutPercentage(district: CandidateListData): number {
  const totalPartyVotes = Object.values(district.partok).reduce(
    (sum, votes) => (sum ?? 0) + (votes ?? 0),
    0,
  );

  if (district.valasztopolgar === 0) {
    return 0;
  }

  return Number(
    (((totalPartyVotes ?? 0) / district.valasztopolgar) * 100).toFixed(2),
  );
}

function PartyDetails({
  partyId,
  data,
  config,
  index,
  selectedParty,
  setSelectedParty,
}: {
  partyId: string;
  data: VotePercentage & { color: string };
  config: CampaignConfig;
  index: number;
  selectedParty: string | null;
  setSelectedParty: (partyId: string | null) => void;
}) {
  const partyName = getPartyById(partyId, config)?.name ?? "Független";
  return (
    <div
      className={classNames(
        "flex justify-between bg-blue-400/10 rounded-md border border-blue-50/10 p-2 mb-2 cursor-pointer",
        selectedParty === partyId && "ring-2 ring-blue-500",
      )}
      onClick={() =>
        setSelectedParty(selectedParty === partyId ? null : partyId)
      }
    >
      <div className="flex items-center mr-4">
        <Text className="mr-4">#{index + 1}</Text>
        <div
          className="size-[15px] rounded mr-2"
          style={{ backgroundColor: data.color }}
        />
        <Text>{partyName}</Text>
      </div>
      <div className="w-[250px] flex items-center">
        <ProgressBar
          width={100}
          percentage={data.percentage}
          color={data.color}
        />
        <Text className="ml-2">{data.percentage.toFixed(1)}%</Text>
        <Text className="ml-2">{data.votes}</Text>
      </div>
    </div>
  );
}

function getPartyColor(partyId: string, config: CampaignConfig) {
  return (
    config.electionConfig.parties.find((party) => party.id === partyId)
      ?.color ?? "#000000"
  );
}

function groupByCounty(districts: CandidateListData[]): CountyGroup[] {
  const countyMap = new Map<number, CountyGroup>();

  districts.forEach((district) => {
    const existingCounty = countyMap.get(district.megyekod);

    if (existingCounty) {
      existingCounty.districts.push(district);
      return;
    }

    countyMap.set(district.megyekod, {
      megyekod: district.megyekod,
      megye: district.megye,
      districts: [district],
    });
  });

  return Array.from(countyMap.values()).sort((a, b) => a.megyekod - b.megyekod);
}
