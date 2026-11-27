import { isCityDistrictMap } from "@shared/domain";
import {
  CandidateListData,
  CurrentView,
  District,
  DistrictPoligon,
  ElectionConfig,
} from "@shared/types";
import { Button } from "@shared/ui/Button";
import { t } from "i18next";
import { type ReactNode, useState } from "react";
import { getWinnerResultByCandidateList } from "../map.utils";
import { BottomBar } from "./BottomBar";
import { DistrictList } from "./DistrictList";
import { MapSidePanel } from "./MapSidePanel";
import { MapWrapper } from "./MapWrapper";
import { getSwingFactorByDistrict } from "./swingFactor.utils";

const MAP_HEIGHT = 450;
const MAIN_MAP_WIDTH = 700;
const SIDE_PANEL_WIDTH = 402;
const MAP_VIEW_MODES = ["map", "list"] as const;
type MapViewMode = (typeof MAP_VIEW_MODES)[number];

interface MapCreatorProps {
  districts: DistrictPoligon[];
  candidateListData: CandidateListData[];
  capitalCity: DistrictPoligon[];
  setCurrentView: (currentView: CurrentView) => void;
  selectedDistrict?: District | null;
  setSelectedDistrict: (district: District | null) => void;
  nationalPercentages?: Record<string, number>;
  electionConfig: ElectionConfig;
  visitBlocked?: boolean;
  isReturning?: boolean;
  mapOverlay?: ReactNode;
}

export function MapCreator({
  candidateListData,
  capitalCity,
  districts,
  setCurrentView,
  selectedDistrict,
  setSelectedDistrict,
  nationalPercentages,
  electionConfig,
  visitBlocked,
  isReturning,
  mapOverlay,
}: MapCreatorProps) {
  const swingFactor = getSwingFactorByDistrict(selectedDistrict);
  const [view, setView] = useState<MapViewMode>("map");
  const isCityMap = isCityDistrictMap(electionConfig);
  return (
    <div className="flex flex-col h-full justify-center items-center">
      <div className="w-[1118px] flex gap-1.5 mb-2" role="group">
        {MAP_VIEW_MODES.map((mode) => (
          <Button
            key={mode}
            variant="tertiary"
            size="sm"
            selected={view === mode}
            aria-pressed={view === mode}
            onClick={() => setView(mode)}
          >
            <Button.Icon name={mode === "map" ? "map" : "list-ul"} />
            <Button.Text>{t(`districtList.view.${mode}`)}</Button.Text>
          </Button>
        ))}
      </div>
      <div className="flex gap-4 mb-4">
        {view === "map" ? (
          <MapWrapper
            width={MAIN_MAP_WIDTH}
            height={MAP_HEIGHT}
            districts={districts}
            results={candidateListData}
            handleDistrict={setSelectedDistrict}
            selectedDistrict={selectedDistrict}
            electionConfig={electionConfig}
            className="w-full"
            overlay={mapOverlay}
          />
        ) : (
          <div
            style={{ width: MAIN_MAP_WIDTH, height: MAP_HEIGHT }}
            data-surface="card"
            className="overflow-y-auto overscroll-contain rounded-md bg-blue-400/10 border border-blue-50/10 pt-4"
          >
            <DistrictList
              isCityMap={isCityMap}
              candidateListData={candidateListData}
              parties={electionConfig.parties}
              selectedDistrict={selectedDistrict ?? null}
              onSelect={(district) =>
                setSelectedDistrict(getWinnerResultByCandidateList(district))
              }
            />
          </div>
        )}
        <MapSidePanel
          width={SIDE_PANEL_WIDTH}
          height={MAP_HEIGHT}
          capitalCity={capitalCity}
          candidateListData={candidateListData}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          swingFactor={swingFactor}
          nationalPercentages={nationalPercentages}
          electionConfig={electionConfig}
          isCityMap={isCityMap}
        />
      </div>
      <div className="w-[1118px]">
        <BottomBar
          data={selectedDistrict}
          onClick={() => setCurrentView("QuestionView")}
          swingFactor={swingFactor}
          visitBlocked={visitBlocked}
          isReturning={isReturning}
        />
      </div>
    </div>
  );
}
