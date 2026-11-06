import { t } from "i18next";
import { type RefObject, useRef, useState } from "react";
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
import { Icon } from "@/shared/ui/Icon";
import { BottomSheet } from "../BottomSheet";
import { getWinnerResultByCandidateList } from "../map.utils";
import {
  formatVoters,
  getDistrictInsight,
  getDistrictName,
  getSwingColor,
} from "./districtInsight.utils";
import { DistrictList, InsightBadge } from "./DistrictList";
import { MapWrapper } from "./MapWrapper";
import { CollapsibleEstimate, EstimateSheetContent } from "./MobileEstimate";
import { getSwingFactorByDistrict } from "./swingFactor.utils";

type MobileView = "list" | "map";
type SheetMode = "district" | "estimate";

const COUNTRY_MAP_RATIO = 0.7;
const CITY_MAP_RATIO = 0.9;

interface MobileMapViewProps {
  isCityMap: boolean;
  districts: DistrictPoligon[];
  capitalCity: DistrictPoligon[];
  candidateListData: CandidateListData[];
  electionConfig: ElectionConfig;
  nationalPercentages?: Record<string, number>;
  selectedDistrict: District | null;
  onSetDistrict: (district: District | null) => void;
  onSetView: (view: CurrentView) => void;
}

export function MobileMapView({
  isCityMap,
  districts,
  capitalCity,
  candidateListData,
  electionConfig,
  nationalPercentages,
  selectedDistrict,
  onSetDistrict,
  onSetView,
}: MobileMapViewProps) {
  const [view, setView] = useState<MobileView>("list");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>("district");

  const openDistrict = (district: District) => {
    onSetDistrict(district);
    setSheetMode("district");
    setIsSheetOpen(true);
  };

  const openEstimate = () => {
    setSheetMode("estimate");
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
          isCityMap={isCityMap}
          candidateListData={candidateListData}
          parties={electionConfig.parties}
          selectedDistrict={selectedDistrict}
          onSelect={(district) =>
            openDistrict(getWinnerResultByCandidateList(district))
          }
        />
      ) : (
        <MobileMap
          isCityMap={isCityMap}
          districts={districts}
          capitalCity={capitalCity}
          candidateListData={candidateListData}
          electionConfig={electionConfig}
          selectedDistrict={selectedDistrict}
          onSelect={openDistrict}
          onOpenEstimate={openEstimate}
        />
      )}

      <BottomSheet
        open={isSheetOpen}
        title={
          sheetMode === "estimate"
            ? t(
                isCityMap
                  ? "estimatePanel.cityTitle"
                  : "estimatePanel.nationalTitle",
              )
            : (sheetData?.megye ?? "")
        }
        onClose={() => setIsSheetOpen(false)}
        hideTitle
        fitContent
      >
        {sheetMode === "estimate" ? (
          <EstimateSheetContent
            key={`${sheetData?.megyekod}-${sheetData?.oevk}`}
            district={sheetData}
            swingFactor={getSwingFactorByDistrict(undefined, sheetData)}
            parties={electionConfig.parties}
            nationalPercentages={nationalPercentages}
            isCityMap={isCityMap}
            onClose={() => setIsSheetOpen(false)}
          />
        ) : (
          sheetData && (
            <DistrictSheetContent
              key={`${sheetData.megyekod}-${sheetData.oevk}`}
              isCityMap={isCityMap}
              district={sheetData}
              parties={electionConfig.parties}
              nationalPercentages={nationalPercentages}
              onClose={() => setIsSheetOpen(false)}
              onVisit={() => onSetView("QuestionView")}
            />
          )
        )}
      </BottomSheet>
    </div>
  );
}

function MobileMap({
  isCityMap,
  districts,
  capitalCity,
  candidateListData,
  electionConfig,
  selectedDistrict,
  onSelect,
  onOpenEstimate,
}: {
  isCityMap: boolean;
  districts: DistrictPoligon[];
  capitalCity: DistrictPoligon[];
  candidateListData: CandidateListData[];
  electionConfig: ElectionConfig;
  selectedDistrict: District | null;
  onSelect: (district: District) => void;
  onOpenEstimate: () => void;
}) {
  const [showCapital, setShowCapital] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver({
    ref: mapRef as RefObject<HTMLDivElement>,
  });
  const visibleDistricts = showCapital ? capitalCity : districts;
  const mapWidth = Math.floor(width);
  const mapHeight = showCapital
    ? mapWidth
    : Math.round(mapWidth * (isCityMap ? CITY_MAP_RATIO : COUNTRY_MAP_RATIO));
  const titleKey = isCityMap
    ? "districtList.map.cityTitle"
    : showCapital
      ? "districtList.map.capitalTitle"
      : "districtList.map.countryTitle";

  return (
    <div className="mx-4 flex flex-col gap-2.5 pb-6">
      <div className="relative rounded-2xl border border-white/8 bg-[rgba(15,29,54,0.55)] p-4">
        <div className="mb-2 flex min-h-[30px] items-center justify-between gap-2">
          <span className="text-[10.5px] uppercase tracking-[1.4px] text-slate-500">
            {t(titleKey, { count: visibleDistricts.length })}
          </span>
          {capitalCity.length > 0 && (
            <Button
              variant="hero"
              size="sm"
              onClick={() => setShowCapital((value) => !value)}
              className="shrink-0"
            >
              {t(
                showCapital
                  ? "districtList.map.showCountry"
                  : "districtList.map.showCapital",
              )}
            </Button>
          )}
          <Button
            onClick={onOpenEstimate}
            variant="hero"
            size="sm"
            className="shrink-0"
          >
            <Button.Icon name="bar-chart-fill" size="xs" color="lightBlue" />
            {t("estimatePanel.mobile.open")}
          </Button>
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
  const leadingPartyIds = new Set<string>(
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
  isCityMap,
  district,
  parties,
  nationalPercentages,
  onClose,
  onVisit,
}: {
  isCityMap: boolean;
  district: CandidateListData;
  parties: RawParty[];
  nationalPercentages?: Record<string, number>;
  onClose: () => void;
  onVisit: () => void;
}) {
  const { leadingParty, swingFactor } = getDistrictInsight(district, parties);

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[1.6px] text-slate-500">
            {t(
              isCityMap
                ? "districtList.sheet.cityLabel"
                : "districtList.sheet.label",
            )}
          </div>
          <div className="mt-0.5 text-xl font-bold tracking-[-0.3px] text-slate-100">
            {isCityMap
              ? getDistrictName(district, isCityMap)
              : `${district.megye} · ${getDistrictName(district, isCityMap)}`}
          </div>
          {!isCityMap && (
            <div className="mt-px text-xs text-blue-400">
              {district.telepules}
            </div>
          )}
        </div>
        <Button
          variant="tertiary"
          size="sm"
          iconOnly
          onClick={onClose}
          className="rounded-full!"
          aria-label={t("bottomSheet.close")}
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

      <div className="mt-4.5">
        <CollapsibleEstimate
          district={district}
          swingFactor={swingFactor}
          parties={parties}
          nationalPercentages={nationalPercentages}
          isCityMap={isCityMap}
        />
      </div>

      <Button size="large" block onClick={onVisit} className="mt-4">
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
