const SWAGS = 6;
const BULBS_PER_SWAG = 4;
const SAG = 10;
const TOP = 2;
const BULB_COLORS = ["#ffe7a3", "#f5c842", "#ffb347"];

const bulbs = Array.from({ length: SWAGS * BULBS_PER_SWAG }, (_, index) => {
  const position = (index + 0.5) / (SWAGS * BULBS_PER_SWAG);
  const swagProgress = (position * SWAGS) % 1;
  return {
    left: `${position * 100}%`,
    top: TOP + SAG * Math.sin(Math.PI * swagProgress),
    color: BULB_COLORS[index % BULB_COLORS.length],
    delay: `${((index * 7) % 11) * 0.35}s`,
  };
});

const wirePath = Array.from({ length: SWAGS }, (_, swag) => {
  const start = (swag / SWAGS) * 100;
  const end = ((swag + 1) / SWAGS) * 100;
  const middle = (start + end) / 2;
  return `M${start},${TOP} Q${middle},${TOP + SAG * 2} ${end},${TOP}`;
}).join(" ");

export function FestiveLights() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6"
    >
      <svg
        className="absolute inset-0 size-full overflow-visible"
        viewBox="0 0 100 24"
        preserveAspectRatio="none"
      >
        <path
          d={wirePath}
          fill="none"
          stroke="rgba(100, 116, 139, 0.7)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {bulbs.map((bulb) => (
        <span
          key={bulb.left}
          className="festive-bulb"
          style={{
            left: bulb.left,
            top: bulb.top,
            backgroundColor: bulb.color,
            color: bulb.color,
            animationDelay: bulb.delay,
          }}
        />
      ))}
    </div>
  );
}
