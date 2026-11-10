import classNames from "classnames";
import { t } from "i18next";
import { useState } from "react";
import { CandidateListData, RawParty } from "@/shared/types";
import { Icon } from "../../../../../../shared/ui/Icon";
import { CandidateRow, StatusTag } from "./DistrictEstimate";
import {
  Estimate,
  EstimateScope,
  getBarScale,
  getScopedEstimate,
} from "./districtEstimate.utils";
import { getDistrictTitle } from "./districtInsight.utils";
import type { SwingFactor } from "./swingFactor.utils";

const TOSSUP_COLOR = "#e5b93a";

interface MobileEstimateProps {
  district?: CandidateListData;
  swingFactor: SwingFactor;
  parties: RawParty[];
  nationalPercentages?: Record<string, number>;
  isCityMap: boolean;
}

/**
 * The district sheet's estimate: collapsed by default to a one-line summary
 * (status + proportional bar), opening to the district / national switch and
 * the full candidate rows.
 */
export function CollapsibleEstimate({
  district,
  swingFactor,
  parties,
  nationalPercentages,
  isCityMap,
}: MobileEstimateProps) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<EstimateScope>("district");
  const summary = getScopedEstimate({
    scope: "district",
    district,
    swingFactor,
    parties,
  });

  if (!summary && !nationalPercentages) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-[10px] border border-blue-50/12 bg-slate-900/35 px-3.5 py-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        data-testid="mobileEstimateToggle"
        className="flex cursor-pointer flex-col gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-bold text-slate-50">
            {t("estimatePanel.mobile.title")}
          </span>
          <span className="flex min-w-0 items-center gap-2.5">
            {summary && !open && <SummaryLabel estimate={summary} />}
            {open && summary && (
              <StatusTag estimate={summary} isNational={false} />
            )}
            <Icon
              name="chevron-down"
              size="xs"
              color="lightBlue"
              className={classNames("transition-transform duration-150", {
                "rotate-180": open,
              })}
            />
          </span>
        </span>
        {summary && !open && <ShareBar estimate={summary} />}
      </button>

      {open && (
        <>
          <ScopeSwitch
            scope={scope}
            onChange={setScope}
            isCityMap={isCityMap}
          />
          <EstimateBody
            scope={scope}
            district={district}
            swingFactor={swingFactor}
            parties={parties}
            nationalPercentages={nationalPercentages}
          />
        </>
      )}
    </div>
  );
}

/** Sheet opened from the map's Estimate button: national first when no district is picked. */
export function EstimateSheetContent({
  district,
  swingFactor,
  parties,
  nationalPercentages,
  isCityMap,
  onClose,
}: MobileEstimateProps & { onClose: () => void }) {
  const [scope, setScope] = useState<EstimateScope>(
    district ? "district" : "national",
  );
  const estimate = getScopedEstimate({
    scope,
    district,
    swingFactor,
    parties,
    nationalPercentages,
  });
  const isNational = scope === "national";

  const title = isNational
    ? t(isCityMap ? "estimatePanel.cityTitle" : "estimatePanel.nationalTitle")
    : district && getDistrictTitle(district, isCityMap);
  const subtitle = isNational
    ? t(
        isCityMap
          ? "estimatePanel.citySubtitle"
          : "estimatePanel.nationalSubtitle",
      )
    : t("estimatePanel.districtSubtitle");

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xl font-bold tracking-[-0.3px] text-slate-100">
            {title}
          </div>
          <div className="mt-0.5 text-xs text-slate-300">{subtitle}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("bottomSheet.close")}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-400/10 text-slate-300 ring-1 ring-inset ring-slate-400/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Icon name="x-lg" size={14} color="currentColor" />
        </button>
      </div>
      {estimate && (
        <div className="-mt-1">
          <StatusTag estimate={estimate} isNational={isNational} />
        </div>
      )}
      <ScopeSwitch
        scope={scope}
        onChange={setScope}
        isCityMap={isCityMap}
        districtDisabled={!district}
      />
      <EstimateBody
        scope={scope}
        district={district}
        swingFactor={swingFactor}
        parties={parties}
        nationalPercentages={nationalPercentages}
      />
      {!district && (
        <p className="text-center text-xs text-slate-300">
          {t(
            isCityMap
              ? "estimatePanel.mobile.tapCityDistrict"
              : "estimatePanel.mobile.tapDistrict",
          )}
        </p>
      )}
    </div>
  );
}

function EstimateBody({
  scope,
  district,
  swingFactor,
  parties,
  nationalPercentages,
}: Omit<MobileEstimateProps, "isCityMap"> & { scope: EstimateScope }) {
  const estimate = getScopedEstimate({
    scope,
    district,
    swingFactor,
    parties,
    nationalPercentages,
  });
  const isNational = scope === "national";

  if (!estimate) {
    return (
      <p className="py-4 text-center text-sm font-light text-slate-300">
        {t("estimatePanel.noData")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-2.5 flex flex-col gap-3">
        {estimate.rows.map((row) => (
          <CandidateRow
            key={row.partyId}
            row={row}
            isLeader={estimate.leader?.partyId === row.partyId}
            showParty={!isNational && !!row.candidateName}
            scale={getBarScale(estimate)}
          />
        ))}
      </div>
      <div className="border-t border-white/8 pt-2.5 text-[11px] text-slate-300">
        {t("estimatePanel.margin")}{" "}
        <b className="font-semibold text-slate-200">±{estimate.margin} pp</b>
      </div>
    </div>
  );
}

function ScopeSwitch({
  scope,
  onChange,
  isCityMap,
  districtDisabled,
}: {
  scope: EstimateScope;
  onChange: (scope: EstimateScope) => void;
  isCityMap: boolean;
  districtDisabled?: boolean;
}) {
  return (
    <div
      role="tablist"
      className="grid grid-cols-2 gap-1 rounded-lg border border-white/8 bg-slate-950/45 p-0.75"
    >
      {(["district", "national"] as const).map((option) => {
        const disabled = option === "district" && districtDisabled;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={scope === option}
            disabled={disabled}
            onClick={() => onChange(option)}
            className={classNames(
              "h-8 rounded-md text-[12.5px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
              scope === option
                ? "bg-white/12 text-white"
                : "text-slate-400 enabled:cursor-pointer enabled:hover:text-slate-200 disabled:text-slate-500",
            )}
          >
            {t(
              option === "national" && isCityMap
                ? "estimatePanel.scope.city"
                : `estimatePanel.scope.${option}`,
            )}
          </button>
        );
      })}
    </div>
  );
}

function SummaryLabel({ estimate }: { estimate: Estimate }) {
  const color =
    estimate.status === "tossup"
      ? TOSSUP_COLOR
      : (estimate.leader?.color ?? TOSSUP_COLOR);
  const leader = estimate.leader?.candidateName ?? estimate.leader?.partyName;

  return (
    <span
      className="truncate text-[10px] font-bold uppercase tracking-[1.2px]"
      style={{ color }}
    >
      {t(`estimatePanel.status.${estimate.status}`)}
      {leader && estimate.status !== "tossup" && ` · ${leader}`}
    </span>
  );
}

function ShareBar({ estimate }: { estimate: Estimate }) {
  return (
    <span
      className="flex h-2 gap-0.5 overflow-hidden rounded-full"
      aria-hidden="true"
    >
      {estimate.rows.map((row) => (
        <span
          key={row.partyId}
          style={{ flexGrow: row.percent, backgroundColor: row.color }}
        />
      ))}
    </span>
  );
}
