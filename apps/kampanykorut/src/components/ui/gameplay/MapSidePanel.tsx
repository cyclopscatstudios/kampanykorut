import classNames from "classnames";
import { t } from "i18next";
import { useState } from "react";
import {
  CandidateListData,
  District,
  DistrictPoligon,
  ElectionConfig,
} from "@/shared/types";
import { DistrictEstimate } from "./DistrictEstimate";
import { isSameDistrict } from "./districtInsight.utils";
import { MapWrapper } from "./MapWrapper";
import type { SwingFactor } from "./swingFactor.utils";

type SidePanelTab = "capital" | "estimate";

const TABS_HEIGHT = 56;

interface MapSidePanelProps {
  width: number;
  height: number;
  capitalCity: DistrictPoligon[];
  candidateListData: CandidateListData[];
  selectedDistrict?: District | null;
  setSelectedDistrict: (district: District | null) => void;
  swingFactor: SwingFactor;
  nationalPercentages?: Record<string, number>;
  electionConfig: ElectionConfig;
  isCityMap: boolean;
}

export function MapSidePanel({
  width,
  height,
  capitalCity,
  candidateListData,
  selectedDistrict,
  setSelectedDistrict,
  swingFactor,
  nationalPercentages,
  electionConfig,
  isCityMap,
}: MapSidePanelProps) {
  const hasCapital = capitalCity.length > 0;
  const [tab, setTab] = useState<SidePanelTab>("estimate");
  const [hasNewEstimate, setHasNewEstimate] = useState(false);
  const districtKey = selectedDistrict
    ? `${selectedDistrict.megyekod}-${selectedDistrict.oevk}`
    : null;
  const [previousDistrictKey, setPreviousDistrictKey] = useState(districtKey);

  if (previousDistrictKey !== districtKey) {
    setPreviousDistrictKey(districtKey);
    if (tab === "capital" && selectedDistrict) {
      setHasNewEstimate(true);
    }
  }

  const selectTab = (next: SidePanelTab) => {
    setTab(next);
    if (next === "estimate") {
      setHasNewEstimate(false);
    }
  };

  const district = candidateListData.find((data) =>
    isSameDistrict(data, selectedDistrict),
  );
  const activeTab = hasCapital ? tab : "estimate";

  return (
    <div
      style={{ width, height }}
      className="flex flex-col overflow-hidden rounded-md border border-blue-50/10 bg-blue-400/10"
    >
      {hasCapital && (
        <div
          role="tablist"
          className="mx-3 mt-3 grid grid-cols-2 gap-1 rounded-lg border border-white/8 bg-slate-950/60 p-1"
        >
          <PanelTab
            label={t("estimatePanel.tabs.capital")}
            selected={activeTab === "capital"}
            onClick={() => selectTab("capital")}
          />
          <PanelTab
            label={t("estimatePanel.tabs.estimate")}
            selected={activeTab === "estimate"}
            hasNotification={hasNewEstimate}
            onClick={() => selectTab("estimate")}
          />
        </div>
      )}
      <div className="relative min-h-0 flex-1">
        {activeTab === "capital" ? (
          <div className="flex h-full items-center justify-center p-3">
            <MapWrapper
              width={width - 26}
              height={height - TABS_HEIGHT - 26}
              districts={capitalCity}
              results={candidateListData}
              handleDistrict={setSelectedDistrict}
              selectedDistrict={selectedDistrict}
              electionConfig={electionConfig}
            />
          </div>
        ) : (
          <DistrictEstimate
            district={district}
            swingFactor={swingFactor}
            parties={electionConfig.parties}
            nationalPercentages={nationalPercentages}
            isCityMap={isCityMap}
          />
        )}
      </div>
    </div>
  );
}

function PanelTab({
  label,
  selected,
  hasNotification,
  onClick,
}: {
  label: string;
  selected: boolean;
  hasNotification?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={classNames(
        "flex h-8 cursor-pointer items-center justify-center gap-1.75 rounded-[5px] text-xs font-semibold tracking-[0.2px]",
        selected
          ? "bg-blue-600 text-white"
          : "text-slate-400 hover:text-slate-200",
      )}
    >
      {label}
      {hasNotification && (
        <span
          className="size-1.5 rounded-full bg-amber-400"
          aria-label={t("estimatePanel.newData")}
        />
      )}
    </button>
  );
}
