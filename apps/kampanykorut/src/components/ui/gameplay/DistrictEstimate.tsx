import classNames from "classnames";
import { t } from "i18next";
import { useState } from "react";
import { AreaIssueView } from "@/shared/domain/Issues";
import { CandidateListData, RawParty } from "@/shared/types";
import { Icon } from "../../../../../../shared/ui/Icon";
import { AreaIssues } from "./AreaIssues";
import {
  Estimate,
  EstimateRow,
  EstimateScope,
  EstimateStatus,
  getBarScale,
  getScopedEstimate,
} from "./districtEstimate.utils";
import { getDistrictTitle } from "./districtInsight.utils";
import type { SwingFactor } from "./swingFactor.utils";

const TOSSUP_COLOR = "#e5b93a";

interface DistrictEstimateProps {
  district?: CandidateListData;
  swingFactor: SwingFactor;
  parties: RawParty[];
  nationalPercentages?: Record<string, number>;
  isCityMap: boolean;
  issues?: AreaIssueView[];
}

export function DistrictEstimate({
  district,
  swingFactor,
  parties,
  nationalPercentages,
  isCityMap,
  issues = [],
}: DistrictEstimateProps) {
  const [scope, setScope] = useState<EstimateScope>("district");

  const isNational = scope === "national";
  const estimate = getScopedEstimate({
    scope,
    district,
    swingFactor,
    parties,
    nationalPercentages,
  });

  const title = isNational
    ? t(isCityMap ? "estimatePanel.cityTitle" : "estimatePanel.nationalTitle")
    : district && getDistrictTitle(district, isCityMap);
  const subtitle = isNational
    ? t(
        isCityMap
          ? "estimatePanel.citySubtitle"
          : "estimatePanel.nationalSubtitle",
      )
    : district &&
      (district.telepules === district.megye
        ? t("estimatePanel.districtSubtitle")
        : `${district.telepules} · ${t("estimatePanel.districtSubtitle")}`);

  return (
    <div className="flex h-full flex-col gap-3.5 px-5 pt-4.5 pb-4">
      {estimate && title ? (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-bold leading-tight text-slate-100">
                {title}
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
            </div>
            <StatusTag estimate={estimate} isNational={isNational} />
          </div>
          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
            {estimate.rows.map((row) => (
              <CandidateRow
                key={row.partyId}
                row={row}
                isLeader={estimate.leader?.partyId === row.partyId}
                showParty={!isNational && !!row.candidateName}
                partyNameOnly={isNational}
                scale={getBarScale(estimate)}
              />
            ))}
          </div>
          {!isNational && <AreaIssues issues={issues} />}
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-center text-sm font-light text-slate-400">
          {isNational || district
            ? t("estimatePanel.noData")
            : t("estimatePanel.selectDistrict")}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between border-t border-white/8 pt-3 text-[11px] text-slate-400">
        <span>
          {estimate && (
            <>
              {t("estimatePanel.margin")}{" "}
              <b className="font-semibold text-slate-300">
                ±{estimate.margin} pp
              </b>
            </>
          )}
        </span>
        <div className="flex gap-0.5 rounded-md border border-white/8 bg-slate-950/60 p-0.5">
          {(["district", "national"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setScope(option)}
              className={classNames(
                "cursor-pointer rounded px-2 py-1 text-[10.5px] font-semibold",
                scope === option
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              {t(
                option === "national" && isCityMap
                  ? "estimatePanel.scope.city"
                  : `estimatePanel.scope.${option}`,
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatusTag({
  estimate,
  isNational,
}: {
  estimate: Estimate;
  isNational: boolean;
}) {
  const color =
    estimate.status === "tossup"
      ? TOSSUP_COLOR
      : (estimate.leader?.color ?? TOSSUP_COLOR);
  const label =
    isNational && estimate.leader
      ? t("estimatePanel.advantage", { party: estimate.leader.shortName })
      : t(`estimatePanel.status.${estimate.status satisfies EstimateStatus}`);

  return (
    <span
      className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[1.2px]"
      style={{ color, borderColor: `${color}66` }}
    >
      {label}
    </span>
  );
}

export function CandidateRow({
  row,
  isLeader,
  showParty,
  partyNameOnly,
  scale,
}: {
  row: EstimateRow;
  isLeader: boolean;
  showParty: boolean;
  partyNameOnly: boolean;
  scale: number;
}) {
  const toPosition = (value: number) => `${(value / scale) * 100}%`;

  return (
    <div className="grid grid-cols-[12px_1fr_auto] items-start gap-x-2.5 gap-y-1.5 mx-2.5">
      <span
        className="mt-0.5 size-3 rounded-full"
        style={{ backgroundColor: row.color }}
      />
      <div className="min-w-0">
        <div className="text-[12.5px] font-bold uppercase tracking-[0.2px] text-slate-100">
          {partyNameOnly ? row.partyName : (row.candidateName ?? row.partyName)}
        </div>
        {showParty && (
          <div className="mt-px text-[11.5px] text-slate-400">
            {row.partyName}
          </div>
        )}
        {isLeader && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-orange-500/35 bg-orange-500/14 py-0.75 pr-2.25 pl-1.75 text-[11px] font-semibold text-orange-300">
            <Icon name="caret-up-fill" size="xs" color="currentColor" />
            {t("estimatePanel.leads")}
          </span>
        )}
      </div>
      <div className="text-right tabular-nums">
        <div className="text-sm font-bold text-slate-100">~{row.percent} %</div>
        <div className="mt-px text-[10.5px] font-medium text-slate-500">
          {row.low}–{row.high}
        </div>
      </div>
      <div className="relative col-span-2 col-start-2 h-1.5 rounded-full bg-white/6">
        <span
          className="absolute inset-y-0 rounded-full opacity-35"
          style={{
            left: toPosition(row.low),
            width: toPosition(row.high - row.low),
            backgroundColor: row.color,
          }}
        />
        <span
          className="absolute -top-0.5 -ml-px h-2.5 w-0.75 rounded-sm"
          style={{ left: toPosition(row.percent), backgroundColor: row.color }}
        />
      </div>
    </div>
  );
}
