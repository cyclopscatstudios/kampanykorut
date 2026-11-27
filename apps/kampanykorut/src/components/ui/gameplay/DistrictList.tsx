import { CandidateListData, District, RawParty } from "@shared/types";
import { Button } from "@shared/ui/Button";
import { Icon } from "@shared/ui/Icon";
import classNames from "classnames";
import { t } from "i18next";
import { useLayoutEffect, useRef, useState } from "react";
import {
  compareBySwing,
  DistrictInsight,
  formatVoters,
  getDistrictInsight,
  getDistrictName,
  getSwingColor,
  isSameDistrict,
} from "./districtInsight.utils";
import { districtKey } from "./visitChange.utils";
import { ChangeCountBadges, DeltaBadge } from "./VisitChangeSummary";

export type DistrictSort = "none" | "swing";

const SORT_OPTIONS: DistrictSort[] = ["none", "swing"];

interface DistrictListProps {
  isCityMap: boolean;
  candidateListData: CandidateListData[];
  parties: RawParty[];
  selectedDistrict: District | null;
  onSelect: (district: CandidateListData) => void;
  changes?: Record<string, number>;
  scrollToSelected?: boolean;
}

export function DistrictList({
  isCityMap,
  candidateListData,
  parties,
  selectedDistrict,
  onSelect,
  changes,
  scrollToSelected = true,
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
            variant="tertiary"
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
                delta={changes?.[districtKey(insight.district)]}
                scrollToSelected={scrollToSelected}
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
                  changes={changes}
                  scrollToSelected={scrollToSelected}
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
                    delta={changes?.[districtKey(insight.district)]}
                    scrollToSelected={scrollToSelected}
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
  changes,
  scrollToSelected,
}: {
  county: string;
  insights: DistrictInsight[];
  isOpen: boolean;
  onToggle: () => void;
  selectedDistrict: District | null;
  onSelect: (district: CandidateListData) => void;
  changes?: Record<string, number>;
  scrollToSelected?: boolean;
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
        data-frost
        className={cardClassName(hasSelected && !isOpen)}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.2px] text-slate-100">
            <PartyDot color={leadingColor} />
            {county}
            {changes && (
              <ChangeCountBadges
                deltas={insights
                  .map((insight) => changes[districtKey(insight.district)])
                  .filter((delta): delta is number => delta !== undefined)}
              />
            )}
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
              delta={changes?.[districtKey(insight.district)]}
              scrollToSelected={scrollToSelected}
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
  delta,
  scrollToSelected,
}: {
  insight: DistrictInsight;
  isCityMap: boolean;
  isSelected: boolean;
  showCounty?: boolean;
  onSelect: (district: CandidateListData) => void;
  delta?: number;
  scrollToSelected?: boolean;
}) {
  const { district, leadingParty, swingFactor } = insight;
  const ref = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (isSelected && scrollToSelected)
      ref.current?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onSelect(district)}
      data-frost
      className={cardClassName(isSelected)}
      aria-pressed={isSelected}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.2px] text-slate-100">
          <PartyDot color={leadingParty?.color} />
          <span>
            {showCounty && `${district.megye} · `}
            {getDistrictName(district, isCityMap)}
          </span>
          <DeltaBadge delta={delta} />
        </span>
        {isSelected && (
          <span className="shrink-0 text-xs font-bold uppercase tracking-[0.6px] text-blue-300">
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
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.75 text-xs font-semibold"
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

function PartyDot({ color }: { color?: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-2.5 shrink-0 rounded-full bg-slate-600"
      style={color ? { backgroundColor: color } : undefined}
    />
  );
}

function cardClassName(isSelected: boolean) {
  return classNames(
    "flex w-full flex-col gap-1.5 rounded-xl border px-3.5 py-3.25 text-left cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue",
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
