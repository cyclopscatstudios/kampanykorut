import { useState } from "react";
import { useWheelZoom, type ViewBox } from "../../hooks/useWheelZoom";
import {
  getWinnerResults,
  type District,
  type DistrictResult,
  type Result,
} from "../ui/map.utils";
import { parsePolygon, projectPoints } from "./geometry";
import { computeBounds, computeScale } from "./projection";
import { buildPathD, simplifyDP } from "./path";
import type { PartyName } from "../../types/color";
import { getFillColor } from "./color";
import {
  getPartyColor,
  getPartyHoverColor,
  getPartyActiveColor,
} from "../ui/color.utils";

interface DistrictMapProps {
  districts: District[];
  result: Result[];
  onClick: (r: DistrictResult) => void;
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  simplifyTolerance?: number;
  selectedDistrict?: DistrictResult | null;
  wheel: ReturnType<typeof useWheelZoom>;
  viewBox: ViewBox;
}

export function DistrictMap({
  districts,
  result,
  width = 1100,
  height = 800,
  stroke = "#000",
  strokeWidth = 0.7,
  simplifyTolerance = 0.00005,
  onClick,
  selectedDistrict,
  wheel,
  viewBox,
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
  const mapWidth = bounds.maxX - bounds.minX;
  const mapHeight = bounds.maxY - bounds.minY;
  const aspectRatio = mapWidth / mapHeight;

  const margin = 20;
  const scale = computeScale(bounds, width, height, margin);

  return (
    <svg
      style={{
        aspectRatio,
        cursor: wheel.isPanning.current ? "grabbing" : "grab",
      }}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      onWheel={wheel.handleWheel}
      onMouseDown={wheel.handleMouseDown}
      onMouseMove={wheel.handleMouseMove}
      onMouseUp={wheel.handleMouseUp}
    >
      {projected.map((d) => {
        const id = `${d.maz}-${d.evk}`;
        const simplified = simplifyDP(d.pts, simplifyTolerance);
        const pathD = buildPathD(simplified, bounds, scale, margin);

        const { winner } = getWinnerResults(d, result);
        const base = getPartyColor(winner as PartyName);
        const hover = getPartyHoverColor(winner as PartyName);
        const active = getPartyActiveColor(winner as PartyName);

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
            onMouseDown={() => setPressed(id)}
            onMouseUp={() => setPressed(null)}
            onClick={() => onClick(getWinnerResults(d, result))}
          />
        );
      })}
    </svg>
  );
}
