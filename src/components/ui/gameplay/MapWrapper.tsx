import { useState } from "react";
import { type ViewBox, useWheelZoom } from "../../../hooks/useWheelZoom";
import { DistrictMap } from "../../DistrictMap/DistrictMap";
import { Button } from "../Button";
import type { District, DistrictResult } from "../map.utils";
import type { CandidateListData } from "../../../logic/ResultTransformer/PipelineTransform";

const initialFullMapViewBox: ViewBox = {
  x: 45,
  y: -35,
  w: 750,
  h: 550,
};

const initialCityMapView: ViewBox = {
  x: -55,
  y: 40,
  w: 650,
  h: 450,
};

export function MapWrapper({
  districts,
  fullView,
  handleDistrict,
  selectedDistrict,
  results,
}: {
  districts: District[];
  fullView: boolean;
  handleDistrict?: (r: DistrictResult) => void;
  results: CandidateListData[];
  selectedDistrict?: DistrictResult | null;
}) {
  const initialView = fullView ? initialFullMapViewBox : initialCityMapView;
  const [viewBox, setViewBox] = useState<ViewBox>(initialView);

  const wheel = useWheelZoom(setViewBox, 1100, 800);

  return (
    <>
      <div className="bg-blue-50/25 rounded-md h-full flex items-center">
        <DistrictMap
          districts={districts}
          result={results}
          onClick={handleDistrict}
          onDoubleClick={handleDistrict}
          width={800}
          height={550}
          stroke="white"
          strokeWidth={0.8}
          selectedDistrict={selectedDistrict}
          viewBox={viewBox}
          wheel={wheel}
        />
      </div>
      <div>
        <Button
          size="small"
          variant="transparent"
          color="lightBlue"
          onClick={() => wheel.zoomIn()}
        >
          <Button.Icon name="zoom-in" />
        </Button>
        <Button
          size="small"
          variant="transparent"
          color="lightBlue"
          onClick={() => wheel.resetViewBox(initialView)}
        >
          <Button.Icon name="fullscreen" />
        </Button>
        <Button
          size="small"
          variant="transparent"
          color="lightBlue"
          onClick={() => wheel.zoomOut()}
        >
          <Button.Icon name="zoom-out" />
        </Button>
      </div>
    </>
  );
}
