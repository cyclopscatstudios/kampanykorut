import { useMemo } from "react";

export type Party = {
  id: string;
  name: string;
  seats: number;
  color: string;
};

type HemicycleProps = {
  parties: Party[];
  width?: number;
  height?: number;
  rows?: number;
  innerRadius?: number;
  outerRadius?: number;
  seatGap?: number;
  order?: "as-given" | "by-seats-desc";
  ariaLabel?: string;
  showLegend?: boolean;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function sum(arr: number[]) {
  let s = 0;
  for (const x of arr) s += x;
  return s;
}

function computeRowSeatCounts(
  totalSeats: number,
  rows: number,
  inner: number,
  outer: number,
) {
  const rowStep = (outer - inner) / rows;
  const radii = Array.from(
    { length: rows },
    (_, i) => inner + (i + 0.5) * rowStep,
  );

  const wSum = sum(radii);
  const counts = radii.map((r) =>
    Math.max(1, Math.round((totalSeats * r) / wSum)),
  );

  let drift = totalSeats - sum(counts);
  let idx = rows - 1;
  while (drift !== 0) {
    if (drift > 0) {
      counts[idx] += 1;
      drift -= 1;
    } else {
      if (counts[idx] > 1) {
        counts[idx] -= 1;
        drift += 1;
      }
    }
    idx -= 1;
    if (idx < 0) idx = rows - 1;
    if (rows === 0) break;
  }

  return { counts, radii, rowStep };
}

function buildSeatPartyIds(parties: Party[]) {
  const ids: string[] = [];
  for (const p of parties) {
    for (let i = 0; i < p.seats; i++) ids.push(p.id);
  }
  return ids;
}

export function ParliamentHemicycle({
  parties,
  width = 720,
  height = 380,
  rows = 8,
  innerRadius,
  outerRadius,
  seatGap = 1.5,
  order = "as-given",
  ariaLabel = "Parlamenti patkó diagram",
  showLegend = true,
}: HemicycleProps) {
  const normalized = useMemo(() => {
    const filtered = parties.filter((p) => p.seats > 0);
    const ordered =
      order === "by-seats-desc"
        ? [...filtered].sort((a, b) => b.seats - a.seats)
        : filtered;

    const totalSeats = ordered.reduce((a, p) => a + p.seats, 0);
    const colorById = new Map(ordered.map((p) => [p.id, p.color]));
    const nameById = new Map(ordered.map((p) => [p.id, p.name]));

    return { ordered, totalSeats, colorById, nameById };
  }, [parties, order]);

  const geom = useMemo(() => {
    const padding = 18;
    const cx = width / 2;
    const cy = height - padding;

    const maxOuter = Math.min(width / 2 - padding, height - padding * 2);
    const outer = outerRadius ?? maxOuter;
    const inner = innerRadius ?? clamp(outer * 0.45, 10, outer - 10);

    const { counts, radii, rowStep } = computeRowSeatCounts(
      normalized.totalSeats,
      rows,
      inner,
      outer,
    );

    const outerMostSeats = counts[counts.length - 1] || 1;
    const outerArcSpacing = (Math.PI * outer) / outerMostSeats;
    const seatDiameter =
      Math.max(2, Math.min(rowStep * 0.92, outerArcSpacing * 0.92)) - seatGap;
    const seatR = Math.max(1.2, seatDiameter / 2);

    return { cx, cy, inner, outer, counts, radii, seatR };
  }, [
    width,
    height,
    rows,
    innerRadius,
    outerRadius,
    seatGap,
    normalized.totalSeats,
  ]);

  const circles = useMemo(() => {
    const seatPartyIds = buildSeatPartyIds(normalized.ordered);

    const start = Math.PI;
    const end = 0;

    const seats: Array<{
      x: number;
      y: number;
      angle: number;
      r: number;
      key: string;
    }> = [];

    for (let row = 0; row < geom.radii.length; row++) {
      const r = geom.radii[row];
      const n = geom.counts[row] ?? 0;
      if (n <= 0) continue;

      const step = n === 1 ? 0 : (end - start) / (n - 1);

      for (let i = 0; i < n; i++) {
        const angle = n === 1 ? (start + end) / 2 : start + i * step;

        const x = geom.cx + r * Math.cos(angle);
        const y = geom.cy - r * Math.sin(angle);

        seats.push({ x, y, angle, r, key: `s-${row}-${i}` });
      }
    }

    seats.sort((a, b) => {
      if (a.angle !== b.angle) return b.angle - a.angle;
      return b.r - a.r;
    });

    return seats.map((s, idx) => {
      const partyId =
        seatPartyIds[idx] ??
        normalized.ordered[normalized.ordered.length - 1]?.id;
      const fill = normalized.colorById.get(partyId) ?? "#999";

      return { x: s.x, y: s.y, fill, key: s.key };
    });
  }, [geom, normalized]);

  const legend = useMemo(() => {
    if (!showLegend) return null;
    const total = normalized.totalSeats || 1;

    return (
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}
      >
        {normalized.ordered.map((p) => {
          const pct = ((p.seats / total) * 100).toFixed(1);
          return (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                lineHeight: 1.2,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: p.color,
                  display: "inline-block",
                }}
              />
              <span className="text-white">
                {p.name}: <b>{p.seats}</b>{" "}
                <span style={{ opacity: 0.7 }}>({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    );
  }, [normalized, showLegend]);

  return (
    <div>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${width} ${height}`}
      >
        <line
          x1={geom.cx - geom.outer}
          y1={geom.cy}
          x2={geom.cx + geom.outer}
          y2={geom.cy}
          stroke="currentColor"
          opacity={0.15}
          strokeWidth={2}
        />

        {circles.map((c) => (
          <circle key={c.key} cx={c.x} cy={c.y} r={geom.seatR} fill={c.fill} />
        ))}
      </svg>

      {legend}
    </div>
  );
}

export function ExampleHungary2018Like() {
  const parties: Party[] = [
    { id: "fidesz", name: "Fidesz–KDNP", seats: 133, color: "#F28E2B" },
    { id: "jobbik", name: "Jobbik", seats: 25, color: "#59A14F" },
    { id: "mszp", name: "MSZP–Párbeszéd", seats: 20, color: "#E15759" },
    { id: "dk", name: "DK", seats: 9, color: "#4E79A7" },
    { id: "lmp", name: "LMP", seats: 8, color: "#76B7B2" },
    { id: "fuggetlen", name: "Független", seats: 3, color: "#9C755F" },
    { id: "nemet", name: "Német nemzetiségi", seats: 1, color: "#BAB0AC" },
  ];

  return (
    <ParliamentHemicycle
      parties={parties}
      width={760}
      height={420}
      rows={9}
      order="as-given"
      ariaLabel="Parlamenti patkó – pártok szerint"
      showLegend
      seatGap={2}
    />
  );
}
