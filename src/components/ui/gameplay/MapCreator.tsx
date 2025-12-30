import type { DistrictResult } from "../map.utils";
import { useState } from "react";
import { Text } from "../Text";
import { Button } from "../Button";
import type { CurrentView } from "./MainGameScreen";
import { MapWrapper } from "./MapWrapper";
import oevk_2022 from "../../../assets/jsons/2022/oevk_2022.json";
import budapest from "../../../assets/jsons/2022/budapest.json";
import results from "../../../assets/jsons/2022/oevk_constituency_results.json";

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
          <div className="bg-blue-50 p-5 w-[300px] h-full flex flex-col justify-center items-center">
            <div className="h-full mb-1">
              <Text color="dark-blue" weight="bold">
                {selectedDistrict?.megye}
              </Text>
              <Text color="dark-blue">{selectedDistrict?.telepules}</Text>
              <Text color="dark-blue" weight="light">
                {selectedDistrict?.valasztopolgar}
              </Text>
            </div>
            <div className="min-h-[50px] w-full">
              <Button
                color="darkBlue"
                fullRounded
                block
                onClick={() => setCurrentView("QuestionView")}
              >
                <Button.Text>Visit district</Button.Text>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
