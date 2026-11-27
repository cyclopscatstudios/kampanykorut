import {
  CandidateListData,
  District,
  DistrictPoligon,
  ElectionConfig,
} from "@shared/types";
import { useCallback, useMemo, useState } from "react";
import { useWheelZoom, type ViewBox } from "../../hooks/useWheelZoom";
import {
  getPartyActiveColor,
  getPartyColor,
  getPartyHoverColor,
} from "../ui/color.utils";
import {
  buildResultsIndex,
  getWinnerResultsByDistrictPoligon,
} from "../ui/map.utils";
import { getFillColor } from "./color";
import { interiorPoint, parsePolygon, projectPoints } from "./geometry";
import { buildPathD, simplifyDP } from "./path";
import { computeBounds, computeOffset, computeScale } from "./projection";

const MARGIN = 20;

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
  selectedDistrict?: { megyekod: number; oevk: number } | null;
  changes?: Record<string, { delta: number; standout: boolean }>;
  wheel: ReturnType<typeof useWheelZoom>;
  viewBox: ViewBox;
  isGameEnded?: boolean;
  electionConfig?: ElectionConfig;
}

function getDistrictId(e: { target: EventTarget | null }) {
  const target = e.target as Element | null;
  return target?.closest<SVGPathElement>("path[data-id]")?.dataset.id ?? null;
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
  onDoubleClick,
  selectedDistrict,
  wheel,
  viewBox,
  isGameEnded,
  electionConfig,
  changes,
}: DistrictMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);

  const projected = useMemo(() => {
    if (!districts?.length) {
      return [];
    }

    const parsed = districts.map((d) => parsePolygon(d.poligon));
    const allPoints = parsed.flat();
    const avgLat = allPoints.reduce((s, p) => s + p.lat, 0) / allPoints.length;
    const cosLat = Math.cos((avgLat * Math.PI) / 180);

    return districts.map((d, i) => ({
      ...d,
      pts: projectPoints(parsed[i], cosLat),
    }));
  }, [districts]);

  const bounds = useMemo(() => computeBounds(projected), [projected]);

  const scale = useMemo(
    () => computeScale(bounds, width, height, MARGIN),
    [bounds, width, height],
  );

  const offset = useMemo(
    () => computeOffset(bounds, scale, width, height),
    [bounds, scale, width, height],
  );

  const resultIndex = useMemo(() => buildResultsIndex(result), [result]);

  const renderData = useMemo(
    () =>
      projected.map((d) => {
        const id = `${d.maz}-${d.evk}`;
        const simplified = simplifyDP(d.pts, simplifyTolerance);
        const pathD = buildPathD(simplified, bounds, scale, offset);
        const interior = interiorPoint(simplified);
        const center = {
          x: offset.x + (interior.x - bounds.minX) * scale,
          y: offset.y + (bounds.maxY - interior.y) * scale,
        };

        const winnerResult = getWinnerResultsByDistrictPoligon(d, resultIndex);
        const { winner, diffPercentage } = winnerResult;
        const partyColor =
          electionConfig?.parties.find((party) => party.id === winner)?.color ??
          "";

        return {
          id,
          megyekod: Number(d.maz),
          oevk: Number(d.evk),
          pathD,
          center,
          winnerResult,
          base: getPartyColor(partyColor, diffPercentage, isGameEnded),
          hover: getPartyHoverColor(partyColor, diffPercentage),
          active: getPartyActiveColor(partyColor, diffPercentage),
        };
      }),
    [
      projected,
      simplifyTolerance,
      bounds,
      scale,
      offset,
      resultIndex,
      isGameEnded,
    ],
  );

  const byId = useMemo(
    () => new Map(renderData.map((item) => [item.id, item])),
    [renderData],
  );

  const handleMouseOver = useCallback((e: React.MouseEvent) => {
    const id = getDistrictId(e);
    if (id) {
      setHovered(id);
    }
  }, []);

  const handleMouseOut = useCallback(() => {
    setHovered(null);
    setPressed(null);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.PointerEvent) => {
      if (!e.isPrimary) return;
      wheel.handleMouseDown(e);
      const id = getDistrictId(e);
      if (id) {
        setPressed(id);
      }
    },
    [wheel],
  );

  const handleMouseUp = useCallback(() => {
    wheel.handleMouseUp();
    setPressed(null);
  }, [wheel]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (wheel.wasDragged()) {
        return;
      }
      const id = getDistrictId(e);
      const item = id ? byId.get(id) : undefined;
      if (item) {
        onClick?.(item.winnerResult);
      }
    },
    [byId, onClick, wheel],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const id = getDistrictId(e);
      const item = id ? byId.get(id) : undefined;
      if (item) {
        onDoubleClick?.(item.winnerResult);
      }
    },
    [byId, onDoubleClick],
  );

  if (!districts?.length) {
    return null;
  }

  return (
    <svg
      width={width}
      height={height}
      style={{
        cursor: wheel.isPanning.current ? "grabbing" : "grab",
        touchAction: "none",
      }}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      preserveAspectRatio="xMidYMid meet"
      onWheel={wheel.handleWheel}
      onPointerDown={handleMouseDown}
      onPointerMove={(e) => e.isPrimary && wheel.handleMouseMove(e)}
      onPointerUp={(e) => e.isPrimary && handleMouseUp()}
      onPointerCancel={(e) => e.isPrimary && handleMouseUp()}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {renderData.map((item) => {
        const isSelected =
          selectedDistrict &&
          item.megyekod === selectedDistrict.megyekod &&
          item.oevk === selectedDistrict.oevk;

        const fill = getFillColor({
          id: item.id,
          hovered,
          pressed,
          isSelected: isSelected ?? false,
          base: item.base,
          hover: item.hover,
          active: item.active,
        });

        return (
          <path
            key={item.id}
            data-id={item.id}
            d={item.pathD}
            fill={fill}
            style={{ cursor: "pointer" }}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );
      })}
      {renderData
        .filter(
          (item) =>
            selectedDistrict &&
            item.megyekod === selectedDistrict.megyekod &&
            item.oevk === selectedDistrict.oevk,
        )
        .flatMap((item) => [
          <path
            key={`selected-outer-${item.id}`}
            d={item.pathD}
            fill="none"
            stroke="#f8fafc"
            strokeWidth={strokeWidth * 5}
            strokeLinejoin="round"
            pointerEvents="none"
          />,
          <path
            key={`selected-inner-${item.id}`}
            d={item.pathD}
            fill="none"
            stroke="#3d63c7"
            strokeWidth={strokeWidth * 2}
            strokeLinejoin="round"
            pointerEvents="none"
          />,
        ])}
      {changes && (
        <g aria-hidden="true" pointerEvents="none">
          {renderData.map((item) => {
            const mapChange = changes[`${item.megyekod}-${item.oevk}`];
            if (!mapChange) return null;
            const { delta, standout } = mapChange;
            const s = strokeWidth * (standout ? 7 : 4.5);
            const { x, y } = item.center;
            const up = delta > 0;
            const points = up
              ? `${x},${y - s} ${x + s},${y + s * 0.75} ${x - s},${y + s * 0.75}`
              : `${x},${y + s} ${x + s},${y - s * 0.75} ${x - s},${y - s * 0.75}`;
            return (
              <polygon
                key={`change-${item.id}`}
                data-change={up ? "up" : "down"}
                points={points}
                fill={up ? "#f8fafc" : "#0f172a"}
                stroke={up ? "#0f172a" : "#f8fafc"}
                strokeWidth={strokeWidth * 1.4}
                strokeLinejoin="round"
              />
            );
          })}
        </g>
      )}
    </svg>
  );
}
