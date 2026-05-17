import {
  getWinnerResultByDistrict,
  type DistrictPoligon,
  type DistrictResult,
} from "../map.utils";
import type { CurrentView } from "./MainGameScreen";
import { MapWrapper } from "./MapWrapper";
import { BottomBar } from "./BottomBar";
import { SwingFactorId } from "../../../types/utils";
import { type CandidateListData } from "@/logic/domain";
import { t } from "i18next";

interface MapCreatorProps {
  districts: DistrictPoligon[];
  candidateListData: CandidateListData[];
  capitalCity: DistrictPoligon[];
  setCurrentView: (currentView: CurrentView) => void;
  selectedDistrict?: DistrictResult | null;
  setSelectedDistrict: (district: DistrictResult | null) => void;
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
}: MapCreatorProps) {
  const swingFactor = getSwingFactor(selectedDistrict);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex w-full h-full justify-between items-center">
        <div className="w-[800px] h-[500px] p-4">
          <MapWrapper
            districts={districts}
            results={candidateListData}
            fullView
            handleDistrict={setSelectedDistrict}
            selectedDistrict={selectedDistrict}
          />
        </div>
        <div className="w-[450px] h-[500px] p-4">
          <MapWrapper
            districts={capitalCity}
            results={candidateListData}
            fullView={false}
            handleDistrict={setSelectedDistrict}
            selectedDistrict={selectedDistrict}
          />
        </div>
      </div>
      <div>
        <div className="h-40 w-full flex justify-center">
          <BottomBar
            data={selectedDistrict}
            onClick={() => setCurrentView("QuestionView")}
            swingFactor={swingFactor}
          />
        </div>
      </div>
    </div>
  );
}

function getSwingFactor(district?: DistrictResult | null) {
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
