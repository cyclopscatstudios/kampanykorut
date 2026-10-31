import classNames from "classnames";
import { t } from "i18next";
import { useState } from "react";
import { CandidateListData, District, RawParty } from "@/shared/types";
import { Button } from "@/shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import {
  compareBySwing,
  DistrictInsight,
  formatVoters,
  getDistrictInsight,
  getDistrictName,
  getSwingColor,
  isSameDistrict,
} from "./districtInsight.utils";

export type DistrictSort = "none" | "swing";

const SORT_OPTIONS: DistrictSort[] = ["none", "swing"];

interface DistrictListProps {
  isCityMap: boolean;
  candidateListData: CandidateListData[];
  parties: RawParty[];
  selectedDistrict: District | null;
  onSelect: (district: CandidateListData) => void;
}

export function DistrictList({
  isCityMap,
  candidateListData,
  parties,
  selectedDistrict,
  onSelect,
}: DistrictListProps) {
  const [sortBy, setSortBy] = useState<DistrictSort>("none");
  const [openCounty, setOpenCounty] = useState<string | null>(
    selectedDistrict?.megye ?? null,
  );

  const insights = candidateListData.map((district) =>
    getDistrictInsight(district, parties),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5 overflow-x-auto px-4">
        {SORT_OPTIONS.map((option) => (
          <Button
            key={option}
            variant="tab"
            size="sm"
            selected={sortBy === option}
            onClick={() => setSortBy(option)}
            className="shrink-0 rounded-full!"
          >
            <Button.Text>{t(`districtList.sort.${option}`)}</Button.Text>
          </Button>
        ))}
      </div>
      <div className="flex flex-col gap-2 px-4 pb-6">
        {sortBy === "none" && isCityMap
          ? insights.map((insight) => (
              <DistrictCard
                key={`${insight.district.megyekod}-${insight.district.oevk}`}
                insight={insight}
                isCityMap
                isSelected={isSameDistrict(insight.district, selectedDistrict)}
                onSelect={onSelect}
              />
            ))
          : sortBy === "none"
            ? groupByCounty(insights).map(([county, countyInsights]) => (
                <CountyGroup
                  key={county}
                  county={county}
                  insights={countyInsights}
                  isOpen={openCounty === county}
                  onToggle={() =>
                    setOpenCounty((current) =>
                      current === county ? null : county,
                    )
                  }
                  selectedDistrict={selectedDistrict}
                  onSelect={onSelect}
                />
              ))
            : [...insights]
                .sort(compareBySwing)
                .map((insight) => (
                  <DistrictCard
                    key={`${insight.district.megyekod}-${insight.district.oevk}`}
                    insight={insight}
                    isCityMap={isCityMap}
                    showCounty={!isCityMap}
                    isSelected={isSameDistrict(
                      insight.district,
                      selectedDistrict,
                    )}
                    onSelect={onSelect}
                  />
                ))}
      </div>
    </div>
  );
}

function CountyGroup({
  county,
  insights,
  isOpen,
  onToggle,
  selectedDistrict,
  onSelect,
}: {
  county: string;
  insights: DistrictInsight[];
  isOpen: boolean;
  onToggle: () => void;
  selectedDistrict: District | null;
  onSelect: (district: CandidateListData) => void;
}) {
  const voters = insights.reduce(
    (sum, insight) => sum + insight.district.valasztopolgar,
    0,
  );
  const leadingColor = getMostSuccessfulParty(insights)?.color;
  const hasSelected = insights.some((insight) =>
    isSameDistrict(insight.district, selectedDistrict),
  );

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cardClassName(hasSelected && !isOpen)}
        style={{ borderLeftColor: leadingColor }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[15px] font-bold tracking-[-0.2px] text-slate-100">
            {county}
          </span>
          <span className="text-slate-400">
            <Icon
              name={isOpen ? "chevron-up" : "chevron-down"}
              size="xs"
              color="currentColor"
            />
          </span>
        </div>
        <span className="text-xs text-slate-400">
          {t("districtList.districtCount", { count: insights.length })} ·{" "}
          {formatVoters(voters)}
          {t("bottomBar.k")} {t("districtList.voters")}
        </span>
      </button>
      {isOpen && (
        <div className="ml-3 flex flex-col gap-2">
          {insights.map((insight) => (
            <DistrictCard
              key={`${insight.district.megyekod}-${insight.district.oevk}`}
              insight={insight}
              isCityMap={false}
              isSelected={isSameDistrict(insight.district, selectedDistrict)}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DistrictCard({
  insight,
  isCityMap,
  isSelected,
  showCounty,
  onSelect,
}: {
  insight: DistrictInsight;
  isCityMap: boolean;
  isSelected: boolean;
  showCounty?: boolean;
  onSelect: (district: CandidateListData) => void;
}) {
  const { district, leadingParty, swingFactor } = insight;

  return (
    <button
      type="button"
      onClick={() => onSelect(district)}
      className={cardClassName(isSelected)}
      style={{ borderLeftColor: leadingParty?.color }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[15px] font-bold tracking-[-0.2px] text-slate-100">
          {showCounty && `${district.megye} · `}
          {getDistrictName(district, isCityMap)}
        </span>
        {isSelected && (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.6px] text-blue-400">
            {t("districtList.selected")}
          </span>
        )}
      </div>
      <span className="text-xs text-slate-400">
        {!isCityMap && `${district.telepules} · `}
        {formatVoters(district.valasztopolgar)}
        {t("bottomBar.k")} {t("districtList.voters")}
      </span>
      <div className="mt-0.5 flex flex-wrap gap-2">
        <InsightBadge
          color={getSwingColor(swingFactor)}
          label={`${t("districtList.swing")}: ${swingFactor.label}`}
        />
        {leadingParty && (
          <InsightBadge color={leadingParty.color} label={leadingParty.name} />
        )}
      </div>
    </button>
  );
}

export function InsightBadge({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.75 text-[11px] font-semibold"
      style={{
        color,
        backgroundColor: `${color}1a`,
        borderColor: `${color}44`,
      }}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function cardClassName(isSelected: boolean) {
  return classNames(
    "flex w-full flex-col gap-1.5 rounded-xl border border-l-[3px] px-3.5 py-3.25 text-left cursor-pointer",
    isSelected
      ? "border-blue-500/40 bg-blue-500/12"
      : "border-white/8 bg-white/2",
  );
}

function groupByCounty(insights: DistrictInsight[]) {
  const groups = new Map<string, DistrictInsight[]>();
  for (const insight of insights) {
    const county = insight.district.megye;
    groups.set(county, [...(groups.get(county) ?? []), insight]);
  }
  return [...groups.entries()];
}

function getMostSuccessfulParty(insights: DistrictInsight[]) {
  const wins = new Map<RawParty, number>();
  for (const { leadingParty } of insights) {
    if (leadingParty) {
      wins.set(leadingParty, (wins.get(leadingParty) ?? 0) + 1);
    }
  }
  const sorted = [...wins.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length > 1 && sorted[0]![1] === sorted[1]![1]) {
    return undefined;
  }
  return sorted[0]?.[0];
}
