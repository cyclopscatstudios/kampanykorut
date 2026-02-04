import type { DistrictResult } from "../map.utils";
import { useState } from "react";
import type { CurrentView } from "./MainGameScreen";
import { MapWrapper } from "./MapWrapper";
import oevk_2022 from "../../../assets/jsons/2022/oevk_2022.json";
import budapest from "../../../assets/jsons/2022/budapest.json";
import results from "../../../assets/jsons/2022/oevk_constituency_results.json";
import { BottomBar } from "./BottomBar";
import { calculateWinner } from "../../../logic/domain/ResultModifier.utils";
import { SwingFactor } from "../../../types/utils";

export function MapCreator({
  setCurrentView,
}: {
  setCurrentView: (currentView: CurrentView) => void;
}) {
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictResult | null>();

  const handleDistrict = (r: DistrictResult) => {
    setSelectedDistrict(r);
  };
  const swingFactor = getSwingFactor(selectedDistrict);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="h-[50px] bg-blue-50 rounded-t">asd</div>
      <div className="flex w-full h-full justify-between items-center">
        <div className="w-[800px] h-[500px] p-4">
          <MapWrapper
            districts={oevk_2022}
            results={results}
            fullView
            handleDistrict={handleDistrict}
            selectedDistrict={selectedDistrict}
          />
        </div>
        <div className="w-[450px] h-[500px] p-4">
          <MapWrapper
            districts={budapest}
            results={results}
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
