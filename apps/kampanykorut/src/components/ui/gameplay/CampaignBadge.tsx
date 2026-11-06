import classNames from "classnames";
import { t } from "i18next";
import { useEffect, useId, useRef, useState } from "react";
import { CampaignConfig, CampaignState } from "@/shared/types";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import { useGetCampaigns } from "../../../logic/application/hooks/useGetCampaigns";
import { BottomSheet } from "../BottomSheet";
import { CampaignBadgeInfo, getCampaignBadgeInfo } from "./campaignBadge.utils";

export interface CampaignBadgeProps {
  state?: CampaignState;
  config?: CampaignConfig;
  /** Desktop: dropdown panel under the chip. Mobile: bottom sheet. */
  variant?: "dropdown" | "sheet";
  /** "pill": bordered chip (desktop header). "inline": borderless, for the mobile context bar. */
  appearance?: "pill" | "inline";
}

export function CampaignBadge({
  state,
  config,
  variant = "dropdown",
  appearance = "pill",
}: CampaignBadgeProps) {
  const campaigns = useGetCampaigns();
  const campaign = campaigns.find((c) => c.id === state?.activeCampaignId);
  const info = getCampaignBadgeInfo(state, config, campaign);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open || variant !== "dropdown") {
      return;
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, variant]);

  if (!info.year && !info.electionTitle) {
    return null;
  }

  return (
    <div ref={rootRef} className="relative">
      <CampaignChip
        info={info}
        open={open}
        appearance={appearance}
        controls={panelId}
        onToggle={() => setOpen((o) => !o)}
      />
      {variant === "dropdown" && open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={t("gameHeader.campaignBadge.title")}
          className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[#4462aa] bg-[#161e30] shadow-xl"
        >
          <CampaignDetails info={info} />
        </div>
      )}
      {variant === "sheet" && (
        <BottomSheet
          open={open}
          title={t("gameHeader.campaignBadge.title")}
          onClose={() => setOpen(false)}
          hideTitle
          fitContent
        >
          <div className="-mx-4.5 -mt-3 overflow-hidden">
            <CampaignDetails info={info} surface="sheet" />
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

function CampaignChip({
  info,
  open,
  appearance,
  controls,
  onToggle,
}: {
  info: CampaignBadgeInfo;
  open: boolean;
  appearance: "pill" | "inline";
  controls: string;
  onToggle: () => void;
}) {
  const label = [info.year, info.campaignName ?? info.electionTitle]
    .filter(Boolean)
    .join(": ");

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={`${label} — ${t("gameHeader.campaignBadge.toggle")}`}
      data-testid="campaignBadge"
      className={classNames(
        "flex cursor-pointer items-center gap-2 transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue",
        appearance === "inline"
          ? "h-11 rounded-md px-2"
          : [
              "h-10 rounded-full border pl-2 pr-2.5",
              open
                ? "border-blue-400 bg-blue-900/70"
                : "border-blue-50/25 bg-blue-900/50 hover:border-blue-50/40 hover:bg-blue-900/70",
            ],
      )}
    >
      <span
        className={classNames(
          "shrink-0 rounded-full ring-2 ring-white/15",
          appearance === "inline" ? "size-3.5" : "size-6",
        )}
        style={{ backgroundColor: info.color }}
      />
      <Text as="span" size="sm" weight="bold">
        {info.year}
      </Text>
      <Icon
        name="chevron-down"
        size="xs"
        color="lightBlue"
        className={classNames("transition-transform duration-150", {
          "rotate-180": open,
        })}
      />
    </button>
  );
}

function CampaignDetails({
  info,
  surface = "dialog",
}: {
  info: CampaignBadgeInfo;
  surface?: "dialog" | "sheet";
}) {
  return (
    <div>
      <div className="relative h-24 bg-blue-900/50">
        {info.bannerUrl && (
          <img src={info.bannerUrl} alt="" className="size-full object-cover" />
        )}
        <div
          className={classNames(
            "absolute inset-0 bg-linear-to-t to-transparent",
            surface === "sheet"
              ? "from-[#22355a] via-[#22355a]/50"
              : "from-[#161e30] via-[#161e30]/50",
          )}
        />
        <div className="absolute inset-x-4 bottom-2">
          <Text size="xs" weight="bold" className="text-slate-300">
            {[info.year, info.campaignName].filter(Boolean).join(" · ")}
          </Text>
          <Text size="base" weight="bold" className="leading-tight">
            {info.electionTitle}
          </Text>
        </div>
      </div>

      <div
        className="h-1"
        style={{ backgroundColor: info.color }}
        aria-hidden="true"
      />

      <div className="flex items-center gap-3 px-4 py-4">
        {info.candidatePortrait ? (
          <img
            src={info.candidatePortrait}
            alt=""
            className="size-16 shrink-0 rounded-full object-cover"
            style={{ boxShadow: `0 0 0 3px ${info.color ?? "transparent"}` }}
          />
        ) : (
          <div
            className="size-16 shrink-0 rounded-full"
            style={{ backgroundColor: info.color }}
          />
        )}
        <div className="min-w-0">
          <Text size="xs" className="text-slate-400">
            {t("gameHeader.campaignBadge.candidate")}
          </Text>
          <Text size="lg" weight="bold" className="leading-snug">
            {info.candidateName ?? "—"}
          </Text>
        </div>
      </div>

      <div className="mx-4 mb-4 flex items-center gap-3 rounded-md border border-blue-50/10 bg-blue-400/10 p-2.5">
        {info.partyLogo && (
          <img
            src={info.partyLogo}
            alt=""
            className="size-9 shrink-0 rounded-md bg-white object-contain"
          />
        )}
        <div className="min-w-0">
          <Text size="xs" className="text-slate-400">
            {t("gameHeader.campaignBadge.party")}
          </Text>
          <Text size="sm" weight="medium" color="lightBlue">
            {info.partyName ?? "—"}
          </Text>
        </div>
      </div>
    </div>
  );
}
