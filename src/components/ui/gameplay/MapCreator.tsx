import { t } from "i18next";
import {
  CandidateListData,
  CurrentView,
  District,
  DistrictPoligon,
  ElectionConfig,
} from "@/shared/types";
import { SwingFactorId } from "../../../types/utils";
import { getWinnerResultByDistrict } from "../map.utils";
import { BottomBar } from "./BottomBar";
import { MapWrapper } from "./MapWrapper";

interface MapCreatorProps {
  districts: DistrictPoligon[];
  candidateListData: CandidateListData[];
  capitalCity: DistrictPoligon[];
  setCurrentView: (currentView: CurrentView) => void;
  selectedDistrict?: District | null;
  setSelectedDistrict: (district: District | null) => void;
  electionConfig?: ElectionConfig;
}

export type SwingFactor = {
  id: SwingFactorId;
  label: string;
};

export function MapCreator({
  candidateListData,
  capitalCity,
  districts,
  setCurrentView,
  selectedDistrict,
  setSelectedDistrict,
  electionConfig,
}: MapCreatorProps) {
  const swingFactor = getSwingFactor(selectedDistrict);
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

function getSwingFactor(district?: District | null) {
  const results = getWinnerResultByDistrict(district);
  if (!results) {
    return {
      label: t("bottomBar.low"),
      id: SwingFactorId.Low,
    };
  }
  const { diffPercentage: percent } = results;

  if (percent < 5) {
    return {
      label: t("bottomBar.high"),
      id: SwingFactorId.High,
    };
  }

  if (percent < 15) {
    return {
      label: t("bottomBar.medium"),
      id: SwingFactorId.Medium,
    };
  }

  if (percent < 20) {
    return {
      label: t("bottomBar.low"),
      id: SwingFactorId.Low,
    };
  }
  return {
    label: t("bottomBar.low"),
    id: SwingFactorId.Low,
  };
}
