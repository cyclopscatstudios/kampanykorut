import {
  CandidateListData,
  CurrentView,
  District,
  DistrictPoligon,
  ElectionConfig,
} from "@/shared/types";
import { BottomBar } from "./BottomBar";
import { MapWrapper } from "./MapWrapper";
import { getSwingFactorByDistrict } from "./swingFactor.utils";

interface MapCreatorProps {
  districts: DistrictPoligon[];
  candidateListData: CandidateListData[];
  capitalCity: DistrictPoligon[];
  setCurrentView: (currentView: CurrentView) => void;
  selectedDistrict?: District | null;
  setSelectedDistrict: (district: District | null) => void;
  electionConfig?: ElectionConfig;
}

export function MapCreator({
  candidateListData,
  capitalCity,
  districts,
  setCurrentView,
  selectedDistrict,
  setSelectedDistrict,
  electionConfig,
}: MapCreatorProps) {
  const swingFactor = getSwingFactorByDistrict(selectedDistrict);
  return (
    <div className="flex flex-col h-full justify-center items-center">
      <div className="flex gap-4 mb-4">
        <MapWrapper
          width={700}
          height={450}
          districts={districts}
          results={candidateListData}
          handleDistrict={setSelectedDistrict}
          selectedDistrict={selectedDistrict}
          electionConfig={electionConfig}
          className="w-full"
        />
        <MapWrapper
          width={400}
          height={450}
          districts={capitalCity}
          results={candidateListData}
          handleDistrict={setSelectedDistrict}
          selectedDistrict={selectedDistrict}
          electionConfig={electionConfig}
        />
      </div>
      <div className="w-[1118px]">
        <BottomBar
          data={selectedDistrict}
          onClick={() => setCurrentView("QuestionView")}
          swingFactor={swingFactor}
        />
      </div>
    </div>
  );
}
