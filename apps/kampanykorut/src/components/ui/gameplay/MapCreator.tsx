import { isCityDistrictMap } from "@/shared/domain";
import {
  CandidateListData,
  CurrentView,
  District,
  DistrictPoligon,
  ElectionConfig,
} from "@/shared/types";
import { BottomBar } from "./BottomBar";
import { MapSidePanel } from "./MapSidePanel";
import { MapWrapper } from "./MapWrapper";
import { getSwingFactorByDistrict } from "./swingFactor.utils";

const MAP_HEIGHT = 450;
const MAIN_MAP_WIDTH = 700;
const SIDE_PANEL_WIDTH = 402;

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
}: MapCreatorProps) {
  const swingFactor = getSwingFactorByDistrict(selectedDistrict);
  return (
    <div className="flex flex-col h-full justify-center items-center">
      <div className="flex gap-4 mb-4">
        <MapWrapper
          width={MAIN_MAP_WIDTH}
          height={MAP_HEIGHT}
          districts={districts}
          results={candidateListData}
          handleDistrict={setSelectedDistrict}
          selectedDistrict={selectedDistrict}
          electionConfig={electionConfig}
          className="w-full"
        />
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
          isCityMap={isCityDistrictMap(electionConfig)}
        />
      </div>
      <div className="w-[1118px]">
        <BottomBar
          data={selectedDistrict}
          onClick={() => setCurrentView("QuestionView")}
          swingFactor={swingFactor}
          visitBlocked={visitBlocked}
        />
      </div>
    </div>
  );
}
