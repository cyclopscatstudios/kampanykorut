import { t } from "i18next";
import { useState } from "react";
import { CampaignConfig } from "@/shared/types";
import type { StatisticResult } from "../statistics.utils";

export function MobileRankings({
  config,
  largestVictories,
  largestDefeats,
  closestDistricts,
}: {
  config: CampaignConfig;
  largestVictories: StatisticResult[];
  largestDefeats: StatisticResult[];
  closestDistricts: StatisticResult[];
}) {
  const [active, setActive] = useState<"wins" | "losses" | "close">("wins");
  const tabs = [
    {
      id: "wins",
      label: "victories",
      title: "biggestVictories",
      color: "#22c55e",
      list: largestVictories,
    },
    {
      id: "losses",
      label: "defeats",
      title: "biggestDefeats",
      color: "#ef4444",
      list: largestDefeats,
    },
    {
      id: "close",
      label: "close",
      title: "closestDistricts",
      color: "#f59e0b",
      list: closestDistricts,
    },
  ] as const;
  const current = tabs.find((tab) => tab.id === active)!;
  return (
    <section className="md:hidden rounded-xl border border-slate-700/50 bg-slate-800/40 px-3.5 pt-3 pb-1">
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-950/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`min-h-10 min-w-0 rounded-lg px-1 text-xs font-bold focus-visible:outline focus-visible:outline-blue-400 ${active === tab.id ? "bg-blue-600 text-white shadow" : "text-slate-400"}`}
          >
            {t(`endResult.statistics.overview.rankingTabs.${tab.label}`)}
          </button>
        ))}
      </div>
      <h3 className="mt-3.5 mb-1 flex items-center gap-2 text-[13px] font-bold text-slate-100">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: current.color }}
        />
        {t(`endResult.statistics.overview.${current.title}`)}
      </h3>
      {current.list.slice(0, 5).map((item, index) => {
        const partyId =
          active === "wins"
            ? item.playerParty
            : active === "losses"
              ? item.opponentParty
              : item.winnerParty;
        const color =
          config.electionConfig.parties.find((party) => party.id === partyId)
            ?.color ?? "#94a3b8";
        const margin = Math.abs(item.percentageDifference);
        const scale = active === "close" ? 4 : 50;
        return (
          <div
            key={`${item.district.megyekod}-${item.district.oevk}`}
            className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-2.5 border-t border-slate-700/30 py-2.5 first-of-type:border-t-0"
          >
            <span className="text-xs font-bold text-slate-500">
              #{index + 1}
            </span>
            <div className="min-w-0">
              <div className="text-[13px] text-slate-100">
                {item.district.megye} {item.district.oevk}
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (margin / scale) * 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
            <span
              className={`text-[13px] font-extrabold tabular-nums ${active === "wins" ? "text-green-300" : active === "losses" ? "text-red-300" : "text-slate-300"}`}
            >
              {active === "wins" ? "+" : active === "losses" ? "−" : ""}
              {margin.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </section>
  );
}
