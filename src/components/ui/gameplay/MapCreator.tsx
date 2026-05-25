import {
  getWinnerResultByDistrict,
  type DistrictPoligon,
  type District,
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
  selectedDistrict?: District | null;
  setSelectedDistrict: (district: District | null) => void;
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
      <div className="flex w-full h-full justify-center items-center gap-4">
        <MapWrapper
          width={700}
          height={450}
          districts={districts}
          results={candidateListData}
          handleDistrict={setSelectedDistrict}
          selectedDistrict={selectedDistrict}
        />
        <MapWrapper
          width={400}
          height={450}
          districts={capitalCity}
          results={candidateListData}
          handleDistrict={setSelectedDistrict}
          selectedDistrict={selectedDistrict}
        />
      </div>
      <div>
        <div className="h-40 mx-10">
          {selectedDistrict && (
            <BottomBar
              data={selectedDistrict}
              onClick={() => setCurrentView("QuestionView")}
              swingFactor={swingFactor}
            />
          )}
        </div>
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
