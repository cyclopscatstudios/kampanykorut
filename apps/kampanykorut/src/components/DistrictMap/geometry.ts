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
