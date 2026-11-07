export function PoliticalEmblem({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} aria-hidden="true">
      <circle
        cx="80"
        cy="80"
        r="76"
        fill="#3b82f6"
        fillOpacity="0.35"
        stroke="#54a2ff"
        strokeWidth="7"
      />
      <circle
        cx="108"
        cy="64"
        r="14"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="6"
        strokeDasharray="10 8"
      />
      <path
        d="M82 118 Q82 87 108 87 Q134 87 134 118"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="6"
        strokeDasharray="10 8"
      />
      <circle cx="64" cy="62" r="16" fill="#eff6ff" />
      <path d="M34 118 Q34 84 64 84 Q94 84 94 118 Z" fill="#eff6ff" />
    </svg>
  );
}
