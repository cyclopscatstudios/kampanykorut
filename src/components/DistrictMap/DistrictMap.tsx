import { useState } from "react";
import { CandidateListData, District, DistrictPoligon } from "@/shared/types";
import { useWheelZoom, type ViewBox } from "../../hooks/useWheelZoom";
import {
  getPartyActiveColor,
  getPartyColor,
  getPartyHoverColor,
} from "../ui/color.utils";
import { getWinnerResultsByList } from "../ui/map.utils";
import { getFillColor } from "./color";
import { parsePolygon, projectPoints } from "./geometry";
import { buildPathD, simplifyDP } from "./path";
import { computeBounds, computeScale } from "./projection";

interface DistrictMapProps {
  districts: DistrictPoligon[];
  result: CandidateListData[];
  onClick?: (r: District) => void;
  onDoubleClick?: (r: District) => void;
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  simplifyTolerance?: number;
  selectedDistrict?: District | null;
  wheel: ReturnType<typeof useWheelZoom>;
  viewBox: ViewBox;
  isGameEnded?: boolean;
}

export function DistrictMap({
  districts,
  result,
  width = 1100,
  height = 800,
  stroke = "#00000033",
  strokeWidth = 0.7,
  simplifyTolerance = 0.00005,
  onClick,
  selectedDistrict,
  wheel,
  viewBox,
  isGameEnded,
}: DistrictMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);

  if (!districts?.length) {
    return null;
  }

  const allPoints = districts.flatMap((d) => parsePolygon(d.poligon));

  const avgLat = allPoints.reduce((s, p) => s + p.lat, 0) / allPoints.length;

  const cosLat = Math.cos((avgLat * Math.PI) / 180);

  const projected = districts.map((d) => ({
    ...d,
    pts: projectPoints(parsePolygon(d.poligon), cosLat),
  }));

  const bounds = computeBounds(projected);

  const margin = 20;
  const scale = computeScale(bounds, width, height, margin);

  return (
    <svg
      width={width}
      height={height}
      style={{
        cursor: wheel.isPanning.current ? "grabbing" : "grab",
      }}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      preserveAspectRatio="xMidYMid meet"
      onWheel={wheel.handleWheel}
      onMouseDown={wheel.handleMouseDown}
      onMouseMove={wheel.handleMouseMove}
      onMouseUp={wheel.handleMouseUp}
    >
      {projected.map((d) => {
        const id = `${d.maz}-${d.evk}`;
        const simplified = simplifyDP(d.pts, simplifyTolerance);
        const pathD = buildPathD(simplified, bounds, scale, margin);

        const { winner, diffPercentage } = getWinnerResultsByList(d, result);
        const base = getPartyColor(winner, diffPercentage, isGameEnded);
        const hover = getPartyHoverColor(winner);
        const active = getPartyActiveColor(winner);

        const isSelected =
          selectedDistrict &&
          Number(d.maz) === selectedDistrict.megyekod &&
          Number(d.evk) === selectedDistrict.oevk;

        const fill = getFillColor({
          id,
          hovered,
          pressed,
          isSelected: isSelected ?? false,
          base,
          hover,
          active,
        });

        return (
          <path
            key={id}
            d={pathD}
            fill={fill}
            style={{ cursor: "pointer" }}
            stroke={stroke}
            strokeWidth={strokeWidth}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => {
              setHovered(null);
              setPressed(null);
            }}
            onDoubleClick={() => onClick?.(getWinnerResultsByList(d, result))}
            onMouseDown={() => setPressed(id)}
            onMouseUp={() => setPressed(null)}
            onClick={() => onClick?.(getWinnerResultsByList(d, result))}
          />
        );
      })}
    </svg>
  );
}
