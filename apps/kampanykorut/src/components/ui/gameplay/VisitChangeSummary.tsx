import { RawParty } from "@shared/types";
import { Button } from "@shared/ui/Button";
import { Icon } from "@shared/ui/Icon";
import classNames from "classnames";
import i18next, { t } from "i18next";
import { type ReactNode, useState } from "react";
import {
  districtKey,
  isVisibleDelta,
  summarizeChange,
  VisitChangeView,
} from "./visitChange.utils";

function formatPoints(value: number, digits = 0) {
  if (digits === 0 && Math.abs(value) < 1) digits = 1;
  return new Intl.NumberFormat(i18next.language || "hu", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Math.abs(value));
}

export function DeltaBadge({
  delta,
  digits = 0,
  className,
  always,
}: {
  delta?: number;
  digits?: number;
  className?: string;
  always?: boolean;
}) {
  if (delta === undefined || (!always && !isVisibleDelta(delta))) return null;
  const up = delta > 0;
  return (
    <ChangePill
      up={up}
      label={t(up ? "visitChange.up" : "visitChange.down", {
        value: formatPoints(delta, digits),
      })}
      className={className}
    >
      {formatPoints(delta, digits)}
    </ChangePill>
  );
}

export function ChangeCountBadges({ deltas }: { deltas: number[] }) {
  const up = deltas.filter((delta) => delta > 0).length;
  const down = deltas.filter((delta) => delta < 0).length;
  return (
    <>
      {up > 0 && (
        <ChangePill up label={t("visitChange.countUp", { count: up })}>
          {up}
        </ChangePill>
      )}
      {down > 0 && (
        <ChangePill
          up={false}
          label={t("visitChange.countDown", { count: down })}
        >
          {down}
        </ChangePill>
      )}
    </>
  );
}

function ChangePill({
  up,
  label,
  className,
  children,
}: {
  up: boolean;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      className={classNames(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full py-0.5 pl-1 pr-1.5 text-xs font-bold leading-none tabular-nums ring-1 ring-inset",
        up
          ? "bg-slate-50/12 text-slate-50 ring-slate-50/25"
          : "bg-slate-950/55 text-slate-300 ring-slate-400/30",
        className,
      )}
    >
      <Icon
        name={up ? "caret-up-fill" : "caret-down-fill"}
        size="xs"
        color="currentColor"
      />
      {children}
    </span>
  );
}

export function VisitChangeSummary({
  view,
  parties,
  className,
  variant = "card",
}: {
  view: VisitChangeView;
  parties: RawParty[];
  className?: string;
  variant?: "card" | "strip";
}) {
  const { change, visited, partyId, onCloseSummary } = view;
  const summary = summarizeChange(
    {
      ...change,
      visited: visited ? districtKey(visited) : undefined,
    },
    partyId,
  );
  const party = parties.find((p) => p.id === partyId);
  const lines = [
    summary.gained > 0 && t("visitChange.gained", { count: summary.gained }),
    summary.lost > 0 && t("visitChange.lost", { count: summary.lost }),
  ].filter((line): line is string => Boolean(line));
  const hasNational = summary.national !== undefined;
  const nothingMoved = !lines.length && !isVisibleDelta(summary.national);
  const partyName = party?.shortName || party?.name;

  if (variant === "strip") {
    const flips = [
      summary.gained > 0 && t("visitChange.gained", { count: summary.gained }),
      summary.lost > 0 && t("visitChange.lost", { count: summary.lost }),
    ].filter((line): line is string => Boolean(line));
    return (
      <section
        aria-label={t("visitChange.title")}
        data-testid="visitChangeSummary"
        className={classNames(
          "flex h-[30px] min-w-0 items-center gap-3 rounded-lg border border-blue-50/10 bg-blue-400/10 pl-3 text-xs text-slate-300",
          className,
        )}
      >
        <span className="shrink-0 font-bold text-slate-50">
          {t("visitChange.title")}
        </span>
        {hasNational && partyName && (
          <span className="flex shrink-0 items-center gap-1">
            {t(view.isCityMap ? "visitChange.city" : "visitChange.national", {
              party: partyName,
            })}
            <DeltaBadge delta={summary.national} digits={1} always />
            <span className="text-slate-400">pp</span>
          </span>
        )}
        {summary.visited && visited && (
          <span className="shrink-0 tabular-nums">
            {visited.telepules}{" "}
            <b className="font-bold text-slate-50">
              {Math.round(summary.visited.before)}% →{" "}
              {Math.round(summary.visited.after)}%
            </b>
          </span>
        )}
        {flips.length > 0 && (
          <span className="truncate">{flips.join(" · ")}</span>
        )}
        {nothingMoved && <NoChangeInfo />}
        <Button
          variant="tertiary"
          size="sm"
          iconOnly
          aria-label={t("visitChange.close")}
          onClick={onCloseSummary}
          className="shrink-0 shadow-none!"
        >
          <Button.Icon name="x-lg" size="xs" />
        </Button>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="visitChangeTitle"
      data-testid="visitChangeSummary"
      className={classNames(
        "flex w-[300px] max-w-full flex-col gap-2.5 rounded-xl border border-[#4462aa] bg-[#161e30]/95 p-3.5 shadow-xl backdrop-blur-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 id="visitChangeTitle" className="text-sm font-bold text-slate-50">
            {t("visitChange.title")}
          </h3>
          <p className="text-xs text-slate-400">{t("visitChange.subtitle")}</p>
        </div>
        <Button
          variant="tertiary"
          size="sm"
          iconOnly
          aria-label={t("visitChange.close")}
          onClick={onCloseSummary}
        >
          <Button.Icon name="x-lg" size="xs" />
        </Button>
      </div>

      {(hasNational || summary.visited) && (
        <dl className="flex flex-col gap-1.5 text-sm">
          {hasNational && partyName && (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-300">
                {t(
                  view.isCityMap ? "visitChange.city" : "visitChange.national",
                  { party: partyName },
                )}
              </dt>
              <dd className="flex items-center gap-1 font-bold text-slate-50">
                <DeltaBadge delta={summary.national} digits={1} always />
                <span className="text-xs font-semibold text-slate-400">pp</span>
              </dd>
            </div>
          )}
          {summary.visited && visited && (
            <div className="flex items-center justify-between gap-3">
              <dt className="truncate text-slate-300">{visited.telepules}</dt>
              <dd className="shrink-0 font-bold tabular-nums text-slate-50">
                {Math.round(summary.visited.before)}% →{" "}
                {Math.round(summary.visited.after)}%
              </dd>
            </div>
          )}
        </dl>
      )}

      {lines.length > 0 && (
        <ul className="flex flex-col gap-1 border-t border-white/8 pt-2 text-xs text-slate-300">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}

      {nothingMoved && (
        <p className="text-xs text-slate-300">{t("visitChange.none")}</p>
      )}
    </section>
  );
}

function NoChangeInfo() {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-label={t("visitChange.noneToggle")}
        onClick={() => setOpen((value) => !value)}
        className="flex size-6 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <Icon name="info-circle" size="xs" color="currentColor" />
      </button>
      {open && (
        <span
          role="note"
          className="absolute left-1/2 top-full z-20 mt-2 w-[260px] -translate-x-1/2 rounded-lg border border-[#4462aa] bg-[#161e30] p-3 text-xs leading-relaxed text-slate-300 shadow-xl"
        >
          {t("visitChange.none")}
        </span>
      )}
    </span>
  );
}
