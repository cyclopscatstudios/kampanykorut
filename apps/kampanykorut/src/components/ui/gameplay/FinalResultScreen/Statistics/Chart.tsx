import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CampaignConfig, HistoryItem } from "@/shared/types";
import { CommonWrapper } from "../../../CommonWrapper";

function createChartData(history: HistoryItem[]) {
  return history.map((entry) => ({
    turn: `n. ${entry.turn}`,

    ...Object.fromEntries(
      Object.entries(entry.results.percentages.partyListResults)
        .filter(([key]) => key !== "_total" && key !== "_other")
        .map(([party, value]) => [party, Number((value * 100).toFixed(1))]),
    ),
  }));
}

export function SupportChart({
  label,
  turnHistory,
  config,
}: {
  label: string;
  turnHistory?: HistoryItem[];
  config: CampaignConfig;
}) {
  if (!turnHistory) {
    return null;
  }
  const data = createChartData(turnHistory);
  const parties = Object.keys(data[0] ?? {}).filter((key) => key !== "turn");

  return (
    <CommonWrapper block>
      <div className="w-full h-[240px] p-2">
        <div className="mb-4 text-white font-semibold">{label}</div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 25,
            }}
          >
            <XAxis dataKey="turn" height={30} stroke="#64748b" />
            <YAxis
              domain={[
                0,
                (dataMax: number) =>
                  Math.max(60, Math.ceil(dataMax / 10) * 10),
              ]}
              stroke="#64748b"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                borderRadius: 8,
              }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={28}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
            />
            {parties.map((party) => {
              const p = config.electionConfig.parties.find(
                (p) => p.id === party,
              );
              return (
                <Line
                  name={p?.name}
                  key={party}
                  type="monotone"
                  dataKey={party}
                  unit="%"
                  stroke={p?.color}
                  strokeWidth={2}
                  dot={true}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CommonWrapper>
  );
}
