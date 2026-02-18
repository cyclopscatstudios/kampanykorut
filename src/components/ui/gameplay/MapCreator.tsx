import type { District, DistrictResult } from "../map.utils";
import { useState } from "react";
import type { CurrentView } from "./MainGameScreen";
import { MapWrapper } from "./MapWrapper";
import { BottomBar } from "./BottomBar";
import { calculateWinner } from "../../../logic/domain/ResultModifier.utils";
import { SwingFactor } from "../../../types/utils";
import type { CandidateListData } from "../../../logic/domain/ResultTransformer/PipelineTransform.types";

interface MapCreatorProps {
  districts: District[];
  candidateListData: CandidateListData[];
  capitalCity: District[];
  setCurrentView: (currentView: CurrentView) => void;
}

export function MapCreator({
  candidateListData,
  capitalCity,
  districts,
  setCurrentView,
}: MapCreatorProps) {
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictResult | null>();

  const handleDistrict = (r: DistrictResult) => {
    setSelectedDistrict(r);
  };
  const swingFactor = getSwingFactor(selectedDistrict);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex w-full h-full justify-between items-center">
        <div className="w-[800px] h-[500px] p-4">
          <MapWrapper
            districts={districts}
            results={candidateListData}
            fullView
            handleDistrict={handleDistrict}
            selectedDistrict={selectedDistrict}
          />
        </div>
        <div className="w-[450px] h-[500px] p-4">
          <MapWrapper
            districts={capitalCity}
            results={candidateListData}
            fullView={false}
            handleDistrict={handleDistrict}
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
  const total = calculateWinner(district);
  const winnerPercent =
    total?.totalVotes === 0
      ? 0
      : Number(
          (((total?.maxVotes ?? 0) / (total?.totalVotes ?? 0)) * 100).toFixed(
            2,
          ),
        );
  if (winnerPercent < 50) {
    return SwingFactor.High;
  } else if (winnerPercent > 50 && winnerPercent < 60) {
    return SwingFactor.Medium;
  } else {
    return SwingFactor.Low;
  }
}
