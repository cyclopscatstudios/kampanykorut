import type { Point } from "./geometry";

export function buildPathD(
  points: Point[],
  bounds: { minX: number; maxY: number },
  scale: number,
  margin: number,
) {
  return (
    points
      .map((p, i) => {
        const x = margin + (p.x - bounds.minX) * scale;
        const y = margin + (bounds.maxY - p.y) * scale;
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ") + " Z"
  );
}

export function simplifyDP(points: Point[], tolerance = 0.00005): Point[] {
  if (points.length <= 2) {
    return points;
  }

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
