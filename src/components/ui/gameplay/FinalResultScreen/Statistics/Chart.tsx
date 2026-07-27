import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HistoryItem } from "@/logic/application";
import { CampaignConfig } from "@/shared/types";
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
            <XAxis dataKey="turn" height={30} />
            <YAxis domain={[0, 60]} />
            <Tooltip />
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
