import { t } from "i18next";
import { useRef, useState } from "react";
import { useResizeObserver } from "usehooks-ts";
import {
  CandidateListData,
  CurrentView,
  District,
  DistrictPoligon,
  ElectionConfig,
  RawParty,
} from "@/shared/types";
import { Button } from "@/shared/ui/Button";
import { BottomSheet } from "../BottomSheet";
import { getWinnerResultByCandidateList } from "../map.utils";
import {
  formatVoters,
  getDistrictInsight,
  getSwingColor,
} from "./districtInsight.utils";
import { DistrictList, InsightBadge } from "./DistrictList";
import { MapWrapper } from "./MapWrapper";

type MobileView = "list" | "map";

const COUNTRY_MAP_RATIO = 0.7;

interface MobileMapViewProps {
  districts: DistrictPoligon[];
  capitalCity: DistrictPoligon[];
  candidateListData: CandidateListData[];
  electionConfig: ElectionConfig;
  selectedDistrict: District | null;
  onSetDistrict: (district: District | null) => void;
  onSetView: (view: CurrentView) => void;
}

export function MobileMapView({
  districts,
  capitalCity,
  candidateListData,
  electionConfig,
  selectedDistrict,
  onSetDistrict,
  onSetView,
}: MobileMapViewProps) {
  const [view, setView] = useState<MobileView>("list");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const openDistrict = (district: District) => {
    onSetDistrict(district);
    setIsSheetOpen(true);
  };

  const sheetData = candidateListData.find(
    (district) =>
      district.megyekod === selectedDistrict?.megyekod &&
      district.oevk === selectedDistrict?.oevk,
  );

  return (
    <div className="h-full overflow-y-auto bg-[radial-gradient(90%_60%_at_50%_0%,rgba(40,80,160,0.12),transparent_60%)] pt-3">
      <div className="mx-4 mb-3 flex gap-1 rounded-[10px] border border-white/8 bg-white/4 p-0.75">
        {(["list", "map"] as const).map((option) => (
          <Button
            key={option}
            variant="tab"
            size="md"
            block
            selected={view === option}
            onClick={() => setView(option)}
            className="flex-1"
          >
            <Button.Text>{t(`districtList.view.${option}`)}</Button.Text>
          </Button>
        ))}
      </div>

      {view === "list" ? (
        <DistrictList
          candidateListData={candidateListData}
          parties={electionConfig.parties}
          selectedDistrict={selectedDistrict}
          onSelect={(district) =>
            openDistrict(getWinnerResultByCandidateList(district))
          }
        />
      ) : (
        <MobileMap
          districts={districts}
          capitalCity={capitalCity}
          candidateListData={candidateListData}
          electionConfig={electionConfig}
          selectedDistrict={selectedDistrict}
          onSelect={openDistrict}
        />
      )}

      <BottomSheet
        open={isSheetOpen}
        title={sheetData?.megye ?? ""}
        onClose={() => setIsSheetOpen(false)}
        hideTitle
      >
        {sheetData && (
          <DistrictSheetContent
            district={sheetData}
            parties={electionConfig.parties}
            onClose={() => setIsSheetOpen(false)}
            onVisit={() => onSetView("QuestionView")}
          />
        )}
      </BottomSheet>
    </div>
  );
}

function MobileMap({
  districts,
  capitalCity,
  candidateListData,
  electionConfig,
  selectedDistrict,
  onSelect,
}: {
  districts: DistrictPoligon[];
  capitalCity: DistrictPoligon[];
  candidateListData: CandidateListData[];
  electionConfig: ElectionConfig;
  selectedDistrict: District | null;
  onSelect: (district: District) => void;
}) {
  const [showCapital, setShowCapital] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver({ ref: mapRef });
  const visibleDistricts = showCapital ? capitalCity : districts;
  const mapWidth = Math.floor(width);
  const mapHeight = showCapital
    ? mapWidth
    : Math.round(mapWidth * COUNTRY_MAP_RATIO);

  return (
    <div className="mx-4 flex flex-col gap-2.5 pb-6">
      <div className="relative rounded-2xl border border-white/8 bg-[rgba(15,29,54,0.55)] p-4">
        <div className="mb-2 flex min-h-[30px] items-center justify-between gap-2">
          <span className="text-[10.5px] uppercase tracking-[1.4px] text-slate-500">
            {t(
              showCapital
                ? "districtList.map.capitalTitle"
                : "districtList.map.countryTitle",
              { count: visibleDistricts.length },
            )}
          </span>
          {capitalCity.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCapital((value) => !value)}
              className="shrink-0 rounded-lg border border-white/16 bg-[rgba(10,20,40,0.8)] px-2.5 py-1.5 text-[10.5px] font-semibold text-slate-400 cursor-pointer"
            >
              {t(
                showCapital
                  ? "districtList.map.showCountry"
                  : "districtList.map.showCapital",
              )}
            </button>
          )}
        </div>
        <div ref={mapRef} className="w-full" style={{ height: mapHeight }}>
          {mapWidth > 0 && (
            <MapWrapper
              key={`${showCapital}-${mapWidth}`}
              width={mapWidth}
              height={mapHeight}
              districts={visibleDistricts}
              results={candidateListData}
              handleDistrict={onSelect}
              selectedDistrict={selectedDistrict}
              electionConfig={electionConfig}
            />
          )}
        </div>
      </div>
      <MapLegend
        parties={electionConfig.parties}
        candidateListData={candidateListData}
      />
    </div>
  );
}

function MapLegend({
  parties,
  candidateListData,
}: {
  parties: RawParty[];
  candidateListData: CandidateListData[];
}) {
  const leadingPartyIds = new Set(
    candidateListData.map(
      (district) => getWinnerResultByCandidateList(district).winner,
    ),
  );
  const leadingParties = parties.filter((party) =>
    leadingPartyIds.has(party.id),
  );

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 text-[10.5px] text-slate-400">
      {leadingParties.map((party) => (
        <span key={party.id} className="flex items-center gap-1.5">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: party.color }}
          />
          {t("districtList.map.leads", { party: party.name })}
        </span>
      ))}
    </div>
  );
}

function DistrictSheetContent({
  district,
  parties,
  onClose,
  onVisit,
}: {
  district: CandidateListData;
  parties: RawParty[];
  onClose: () => void;
  onVisit: () => void;
}) {
  const { leadingParty, swingFactor } = getDistrictInsight(district, parties);

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[1.6px] text-slate-500">
            {t("districtList.sheet.label")}
          </div>
          <div className="mt-0.5 text-xl font-bold tracking-[-0.3px] text-slate-100">
            {district.megye} · {district.oevk}. OEVK
          </div>
          <div className="mt-px text-xs text-blue-400">
            {district.telepules}
          </div>
        </div>
        <Button
          variant="tertiary"
          size="sm"
          iconOnly
          onClick={onClose}
          className="rounded-full!"
        >
          <Button.Icon name="x-lg" />
        </Button>
      </div>

      <div className="mt-4.5 grid grid-cols-2 gap-3">
        <SheetMetric label={t("bottomBar.population")}>
          {formatVoters(district.valasztopolgar)}
          {t("bottomBar.k")}
        </SheetMetric>
        <SheetMetric label={t("bottomBar.swingFactor")}>
          <span style={{ color: getSwingColor(swingFactor) }}>
            {swingFactor.label}
          </span>
        </SheetMetric>
        {leadingParty && (
          <div className="col-span-2">
            <SheetMetric label={t("districtList.sheet.currentLead")}>
              <InsightBadge
                color={leadingParty.color}
                label={leadingParty.name}
              />
            </SheetMetric>
          </div>
        )}
      </div>

      <Button size="large" block onClick={onVisit} className="mt-5">
        <Button.Text>{t("bottomBar.visitDistrict")}</Button.Text>
        <Button.Icon name="arrow-right" color="white" />
      </Button>
    </div>
  );
}

function SheetMetric({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[9.5px] uppercase tracking-[1.2px] text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-100">
        {children}
      </div>
    </div>
  );
}
