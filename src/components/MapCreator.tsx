import oevk_2022 from "../assets/jsons/oevk_2022.json";
import results from "../assets/jsons/2022_results.json";
import budapest from "../assets/jsons/budapest.json";
import type { District, DistrictResult } from "./ui/map.utils";
import { useState } from "react";
import { DistrictMap } from "./DistrictMap/DistrictMap";
import { Text } from "./ui/Text";
import { Button } from "./ui/Button";
import { useWheelZoom, type ViewBox } from "../hooks/useWheelZoom";

export function MapCreator() {
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictResult | null>();

  const handleDistrict = (r: DistrictResult) => {
    setSelectedDistrict(r);
  };

  return (
    <div className="flex flex-col h-full w-full border-8 border-blue-900/50">
      <div className="h-[50px] bg-blue-50 rounded-t">asd</div>
      <div className="flex w-full h-full justify-between items-center">
        <div className="w-[800px] h-full">
          <MapWithWheelZoom
            districts={oevk_2022}
            fullView
            handleDistrict={handleDistrict}
            selectedDistrict={selectedDistrict}
          />
        </div>
        <div className="w-[450px]">
          <MapWithWheelZoom
            districts={budapest}
            fullView={false}
            handleDistrict={handleDistrict}
            selectedDistrict={selectedDistrict}
          />
        </div>
      </div>
      <div>
        <div className="bg-blue-50 p-5 h-[160px]">
          <Text color="dark-blue" weight="bold">
            {selectedDistrict?.megye}
          </Text>
          <Text color="dark-blue">{selectedDistrict?.telepules}</Text>
          <Text color="dark-blue" weight="light">
            {selectedDistrict?.valasztopolgar}
          </Text>
          <Button color="darkBlue" fullRounded block>
            <Text color="light-blue">Visit district</Text>
          </Button>
        </div>
      </div>
    </div>
  );
}

const initialFullMapViewBox: ViewBox = {
  x: 45,
  y: -35,
  w: 750,
  h: 550,
};

const initialCityMapView: ViewBox = {
  x: -55,
  y: 5,
  w: 650,
  h: 450,
};

function MapWithWheelZoom({
  districts,
  fullView,
  handleDistrict,
  selectedDistrict,
}: {
  districts: District[];
  fullView: boolean;
  handleDistrict: (r: DistrictResult) => void;
  selectedDistrict?: DistrictResult | null;
}) {
  const initialView = fullView ? initialFullMapViewBox : initialCityMapView;
  const [viewBox, setViewBox] = useState<ViewBox>(initialView);

  const wheel = useWheelZoom(setViewBox, 1100, 800);

  return (
    <div>
      <DistrictMap
        districts={districts}
        result={results}
        onClick={handleDistrict}
        width={800}
        height={550}
        stroke="white"
        strokeWidth={0.8}
        selectedDistrict={selectedDistrict}
        viewBox={viewBox}
        wheel={wheel}
      />
      <div>
        <Button size="small" color="lightBlue" onClick={() => wheel.zoomIn()}>
          <i className="bi bi-zoom-in"></i>
        </Button>
        <Button
          size="small"
          color="lightBlue"
          onClick={() => wheel.resetViewBox(initialView)}
        >
          <i className="bi bi-fullscreen"></i>
        </Button>
        <Button size="small" color="lightBlue" onClick={() => wheel.zoomOut()}>
          <i className="bi bi-zoom-out"></i>
        </Button>
      </div>
    </div>
  );
}
