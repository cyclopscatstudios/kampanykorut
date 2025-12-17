import type { Point } from "./geometry";

export function computeBounds(districts: { pts: Point[] }[]) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  districts.forEach((d) =>
    d.pts.forEach((p) => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }),
  );

  return { minX, maxX, minY, maxY };
}

export function computeScale(
  bounds: ReturnType<typeof computeBounds>,
  width: number,
  height: number,
  margin: number,
) {
  const projW = bounds.maxX - bounds.minX;
  const projH = bounds.maxY - bounds.minY;

  return Math.min((width - margin * 2) / projW, (height - margin * 2) / projH);
}
