export type RawPoint = { lat: number; lon: number };
export type Point = { x: number; y: number };

export function parsePolygon(poly: string): RawPoint[] {
  return poly.split(",").map((pair) => {
    const [latStr, lonStr] = pair.trim().split(/\s+/);
    return {
      lat: parseFloat(latStr),
      lon: parseFloat(lonStr),
    };
  });
}

export function projectPoints(pts: RawPoint[], cosLat: number): Point[] {
  return pts.map((p) => ({
    x: p.lon * cosLat,
    y: p.lat,
  }));
}

function isInside(pt: Point, poly: Point[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (
      a.y > pt.y !== b.y > pt.y &&
      pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function distToSegment(pt: Point, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2
    ? Math.max(0, Math.min(1, ((pt.x - a.x) * dx + (pt.y - a.y) * dy) / len2))
    : 0;
  return Math.hypot(pt.x - (a.x + t * dx), pt.y - (a.y + t * dy));
}

function distToEdges(pt: Point, poly: Point[]) {
  let min = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    min = Math.min(min, distToSegment(pt, poly[i], poly[j]));
  }
  return min;
}

/**
 * A point inside the polygon, even for concave shapes. Uses the vertex average
 * when it lies inside (convex case), otherwise the grid point farthest from
 * the edges.
 */
export function interiorPoint(poly: Point[]): Point {
  const avg = {
    x: poly.reduce((s, p) => s + p.x, 0) / poly.length,
    y: poly.reduce((s, p) => s + p.y, 0) / poly.length,
  };
  if (poly.length < 3 || isInside(avg, poly)) return avg;

  const xs = poly.map((p) => p.x);
  const ys = poly.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const stepX = (Math.max(...xs) - minX) / 24;
  const stepY = (Math.max(...ys) - minY) / 24;
  let best = avg;
  let bestDist = -1;
  for (let i = 0; i <= 24; i++) {
    for (let j = 0; j <= 24; j++) {
      const pt = { x: minX + i * stepX, y: minY + j * stepY };
      if (!isInside(pt, poly)) continue;
      const dist = distToEdges(pt, poly);
      if (dist > bestDist) {
        best = pt;
        bestDist = dist;
      }
    }
  }
  return best;
}
