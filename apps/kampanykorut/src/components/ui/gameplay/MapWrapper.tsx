import classNames from "classnames";
import { useState } from "react";
import {
  CandidateListData,
  District,
  DistrictPoligon,
  ElectionConfig,
} from "@/shared/types";
import { useWheelZoom, type ViewBox } from "../../../hooks/useWheelZoom";
import { DistrictMap } from "../../DistrictMap/DistrictMap";
import { Button } from "../Button";

export function MapWrapper({
  districts,
  handleDistrict,
  selectedDistrict,
  results,
  className,
  width = 800,
  height = 550,
  isGameEnded = false,
  stroke = "#000000FF",
  view,
  electionConfig,
}: {
  districts: DistrictPoligon[];
  handleDistrict?: (r: District) => void;
  results: CandidateListData[];
  selectedDistrict?: District | null;
  className?: string;
  width?: number;
  height?: number;
  isGameEnded?: boolean;
  stroke?: string;
  view?: ViewBox;
  electionConfig?: ElectionConfig;
}) {
  const initialView = view ?? { x: 0, y: 0, w: width, h: height };
  const [viewBox, setViewBox] = useState<ViewBox>(initialView);

  const wheel = useWheelZoom(setViewBox, 1100, 800);

  const BASE_STROKE_WIDTH = 0.8;
  const zoomRatio = viewBox.w / initialView.w;
  const dynamicStrokeWidth = Math.max(0.05, BASE_STROKE_WIDTH * zoomRatio);

  return (
    <div
      style={{ width, height }}
      className={classNames(
        "relative overflow-hidden rounded-md bg-blue-400/10 border border-blue-50/10",
        className,
      )}
    >
      <DistrictMap
        districts={districts}
        result={results}
        onClick={handleDistrict}
        onDoubleClick={handleDistrict}
        width={width}
        height={height}
        stroke={stroke}
        strokeWidth={dynamicStrokeWidth}
        selectedDistrict={selectedDistrict}
        viewBox={viewBox}
        wheel={wheel}
        isGameEnded={isGameEnded}
        electionConfig={electionConfig}
      />
      <div className="absolute bottom-2 right-2 flex gap-1">
        <Button
          variant="tertiary"
          onClick={() => wheel.zoomIn()}
          className="border border-blue-50/10"
        >
          <Button.Icon name="plus" />
        </Button>
        <Button
          variant="tertiary"
          onClick={() => wheel.resetViewBox(initialView)}
          className="border border-blue-50/10"
        >
          <Button.Icon name="fullscreen" />
        </Button>
        <Button
          variant="tertiary"
          onClick={() => wheel.zoomOut()}
          className="border border-blue-50/10"
        >
          <Button.Icon name="dash" />
        </Button>
      </div>
    </div>
  );
}
