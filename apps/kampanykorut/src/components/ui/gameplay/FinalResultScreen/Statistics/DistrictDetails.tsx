import classNames from "classnames";
import { t } from "i18next";
import { useCallback, useMemo, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import {
  CampaignConfig,
  CampaignState,
  CandidateListData,
  FinalResults,
} from "@/shared/types";
import { Button } from "../../../../../../../../shared/ui/Button";
import { Text } from "../../../../../../../../shared/ui/Text";
import { Badge } from "../../../Badge";
import { BottomSheet } from "../../../BottomSheet";
import { SidebarPanel } from "../../../SidebarPanel";
import {
  calculateVotePercentages,
  getPartyById,
  type VotePercentage,
} from "../electionMap.utils";
import { AdvancedProgressBar, ProgressBar } from "./ProgressBar";

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
  const [selectedCounty, setSelectedCounty] = useState<
    CountyGroup | undefined
  >();

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [countySheetOpen, setCountySheetOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] =
    useState<CandidateListData | null>(null);
  const closeCounty = useCallback(() => setCountySheetOpen(false), []);
  const closeDistrict = useCallback(() => setSelectedDistrict(null), []);
  const districts = useMemo(
    () => state?.candidateListData ?? [],
    [state?.candidateListData],
  );

  const counties = useMemo(() => groupByCounty(districts), [districts]);

  const selectedCountyDistricts = useMemo(
    () =>
      selectedCounty === null
        ? []
        : districts.filter((d) => d.megyekod === selectedCounty?.megyekod),
    [districts, selectedCounty],
  );

  if (!isDesktop) {
    return (
      <div className="flex flex-col gap-3">
        <Button
          variant="tertiary"
          block
          onClick={() => setCountySheetOpen(true)}
        >
          <Button.Text>
            {selectedCounty?.megye ??
              t("endResult.statistics.menuBar.districtDetails")}
          </Button.Text>
          <Button.Icon name="chevron-down" />
        </Button>
        {(selectedCounty ? selectedCountyDistricts : districts).map(
          (district) => (
            <DistrictCard
              key={`${district.megyekod}-${district.oevk}`}
              district={district}
              config={config}
              onOpen={() => setSelectedDistrict(district)}
            />
          ),
        )}
        <BottomSheet
          open={countySheetOpen}
          onClose={closeCounty}
          title={t("endResult.statistics.menuBar.districtDetails")}
        >
          <SidebarPanel
            data={counties}
            selected={selectedCounty}
            onSelect={(county) => {
              setSelectedCounty(county);
              setCountySheetOpen(false);
            }}
            getKey={(county: CountyGroup) => county.megyekod}
            renderItem={(county) => <>{county.megye}</>}
          />
        </BottomSheet>
        <BottomSheet
          open={selectedDistrict !== null}
          onClose={closeDistrict}
          title={
            selectedDistrict
              ? `${selectedDistrict.megye} ${selectedDistrict.oevk}`
              : ""
          }
        >
          {selectedDistrict && (
            <DistrictCard
              key={`${selectedDistrict.megyekod}-${selectedDistrict.oevk}`}
              district={selectedDistrict}
              config={config}
            />
          )}
        </BottomSheet>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full min-w-0 gap-2">
      <div className="max-h-40 md:max-h-[500px] w-full md:w-[350px] overflow-y-auto md:pr-2">
        <SidebarPanel
          data={counties}
          selected={selectedCounty}
          onSelect={setSelectedCounty}
          getKey={(county: CountyGroup) => county.megyekod}
          renderItem={(county) => (
            <>
              {county.megye} {county.megyekod}
            </>
          )}
        />
      </div>
      <div className="w-full md:w-[750px] md:max-h-[500px] md:overflow-y-auto py-2 md:p-2">
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
  onOpen?: () => void;
}

function DistrictCard({ district, config, onOpen }: DistrictCardProps) {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const votePercentage = useMemo(() => {
    const percentages = calculateVotePercentages(
      district.partok,
      district.jeloltek,
    );

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
  }, [district.partok, district.jeloltek, config]);

  const turnout = getPartyVotesTurnoutPercentage(district);

  const leadingPartyColor =
    Object.values(votePercentage)[0]?.color ?? "#000000";

  const winnerPartyId = Object.entries(votePercentage).find(
    ([, data]) => data.isWinner,
  )?.[0];

  const partyName =
    getPartyById(winnerPartyId ?? "", config)?.name ?? "Független";

  if (onOpen) {
    const leader = Object.values(votePercentage)[0];
    return (
      <button
        type="button"
        onClick={onOpen}
        className="w-full rounded-xl border border-slate-700/50 bg-slate-800/40 p-3.5 text-left text-slate-100 focus-visible:outline focus-visible:outline-blue-400"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-extrabold">
              {district.megye} {district.oevk}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {district.telepules} ·{" "}
              {t("endResult.statistics.districtDetails.turnout", {
                value: turnout.toFixed(1),
              })}
            </div>
          </div>
          <span
            aria-hidden="true"
            className="bi bi-chevron-up shrink-0 text-slate-400"
          />
        </div>
        <div className="my-3">
          <AdvancedProgressBar votePercentage={votePercentage} />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: leadingPartyColor }}
          />
          <span className="min-w-0 flex-1">{partyName}</span>
          <span className="shrink-0 font-bold">
            {leader?.percentage.toFixed(1)}%
          </span>
        </div>
      </button>
    );
  }

  return (
    <div
      className="bg-blue-400/10 rounded-md border border-blue-50/10 p-4 mb-4"
      style={{
        borderLeft: `4px solid ${leadingPartyColor}`,
      }}
    >
      <div className="flex flex-col md:flex-row justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-baseline">
          <Text weight="bold" size="lg" className="mr-2">
            {district.megye} {district.oevk}
          </Text>
          <Text color="blue">{district.telepules}</Text>
        </div>
        <div>
          <Text>
            {t("endResult.statistics.districtDetails.turnout", {
              value: turnout.toFixed(1),
            })}
          </Text>
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
        "grid grid-cols-[minmax(0,1fr)_auto] md:flex md:flex-row gap-2 justify-between border-b border-slate-700/40 py-3 md:bg-blue-400/10 md:rounded-md md:border md:border-blue-50/10 md:p-2 md:mb-2 cursor-pointer",
        selectedParty === partyId && "ring-2 ring-blue-500",
      )}
      onClick={() =>
        setSelectedParty(selectedParty === partyId ? null : partyId)
      }
    >
      <div className="flex min-w-0 items-center gap-2 md:gap-0 md:mr-4">
        <Text className="text-xs text-slate-500 md:mr-4">#{index + 1}</Text>
        <div
          className="size-[15px] shrink-0 rounded mr-2"
          style={{ backgroundColor: data.color }}
        />
        <div className="min-w-0 flex-1">
          <Text className="max-md:!text-xs">
            {selectedParty === partyId ? data.candidates : partyName}
          </Text>
          <div className="mt-1.5 h-1 rounded-full bg-white/10 md:hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, data.percentage)}%`,
                backgroundColor: data.color,
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end justify-center text-xs md:w-[250px] md:flex-row md:flex-wrap md:items-center gap-y-1">
        <div className="hidden md:block">
          <ProgressBar
            width={100}
            percentage={data.percentage}
            color={data.color}
          />
        </div>
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
