import React from "react";

type District = {
  maz: string;
  evk: string;
  centrum: string;
  poligon: string;
};

type RawPoint = { lat: number; lon: number };
type Point = { x: number; y: number };

// --- 1. Poligon adat parsolása ---
function parsePolygon(poly: string): RawPoint[] {
  return poly.split(",").map((pair) => {
    const [latStr, lonStr] = pair.trim().split(/\s+/);
    return {
      lat: parseFloat(latStr),
      lon: parseFloat(lonStr),
    };
  });
}

// --- 2. Vetítés (long * cos(avgLat)) ---
function projectPoints(pts: RawPoint[], cosLat: number): Point[] {
  return pts.map((p) => ({
    x: p.lon * cosLat,
    y: p.lat,
  }));
}

// --- 3. Douglas–Peucker poligon-simítás ---
function simplifyDP(points: Point[], tolerance = 0.00005): Point[] {
  if (points.length <= 2) return points;

  const sqTolerance = tolerance * tolerance;
  const simplified = [points[0]];

  function sqSegDist(p: Point, a: Point, b: Point) {
    let x = a.x;
    let y = a.y;
    let dx = b.x - x;
    let dy = b.y - y;

    if (dx !== 0 || dy !== 0) {
      const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = b.x;
        y = b.y;
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }

    dx = p.x - x;
    dy = p.y - y;
    return dx * dx + dy * dy;
  }

  function reduce(first: number, last: number) {
    let maxDist = sqTolerance;
    let index = -1;

    for (let i = first + 1; i < last; i++) {
      const dist = sqSegDist(points[i], points[first], points[last]);
      if (dist > maxDist) {
        maxDist = dist;
        index = i;
      }
    }

    if (index !== -1) {
      if (index - first > 1) reduce(first, index);
      simplified.push(points[index]);
      if (last - index > 1) reduce(index, last);
    }
  }

  reduce(0, points.length - 1);
  simplified.push(points.at(-1)!);

  return simplified;
}

// --- 4. A React komponens ---

export function DistrictMap({
  districts,
  width = 1100,
  height = 800,
  stroke = "#000",
  strokeWidth = 0.7,
  simplifyTolerance = 0.00005,
}: {
  districts: District[];
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  simplifyTolerance?: number;
}) {
  if (!districts || districts.length === 0) return null;

  // Átlagos szélesség → cos(lat) vetítéshez
  let sumLat = 0;
  let count = 0;

  districts.forEach((d) =>
    parsePolygon(d.poligon).forEach((p) => {
      sumLat += p.lat;
      count++;
    }),
  );

  const avgLat = sumLat / count;
  const cosLat = Math.cos((avgLat * Math.PI) / 180);

  // Vetített bounding box számítása
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  const projected = districts.map((d) => {
    const rawPts = parsePolygon(d.poligon);
    const pts = projectPoints(rawPts, cosLat);

    pts.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    return { ...d, pts };
  });

  const margin = 20;
  const projW = maxX - minX;
  const projH = maxY - minY;

  // Egy közös scale, hogy ne torzuljon
  const scale = Math.min(
    (width - margin * 2) / projW,
    (height - margin * 2) / projH,
  );

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {projected.map((d) => {
        const simplified = simplifyDP(d.pts, simplifyTolerance);

        const pathD =
          simplified
            .map((p, i) => {
              const x = margin + (p.x - minX) * scale;
              const y = margin + (maxY - p.y) * scale; // y-tükrözés
              return `${i === 0 ? "M" : "L"}${x},${y}`;
            })
            .join(" ") + " Z";

        return (
          <path
            pointerEvents="all"
            fill="transparent"
            onClick={() => console.log({ d })}
            key={`${d.maz}-${d.evk}`}
            data-maz={d.maz}
            data-evk={d.evk}
            d={pathD}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );
      })}
    </svg>
  );
}
