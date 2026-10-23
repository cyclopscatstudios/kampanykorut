import type { VotePercentage } from "../electionMap.utils";

type ProgressBarProps = {
  percentage: number;
  color: string;
  width?: number;
};

export function ProgressBar({
  percentage,
  color,
  width = 200,
}: ProgressBarProps) {
  // width is applied inline: Tailwind cannot generate classes from interpolated strings
  return (
    <div
      className="h-3 bg-white/10 rounded-full overflow-hidden"
      style={{ width }}
    >
      <div
        className="h-full transition-all duration-300"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
}

type AdvancedProgressBarProps = {
  votePercentage:
    | Record<string, VotePercentage & { color: string }>
    | undefined;
};

export function AdvancedProgressBar({
  votePercentage,
}: AdvancedProgressBarProps) {
  const sortedParties = Object.entries(votePercentage ?? {}).sort(
    ([, a], [, b]) => (b.votes ?? 0) - (a.votes ?? 0),
  );

  return (
    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden flex">
      {sortedParties.map(([party, data]) => (
        <div
          key={party}
          className="h-full transition-all duration-300"
          style={{
            width: `${data.percentage}%`,
            backgroundColor: data.color,
          }}
        />
      ))}
    </div>
  );
}
