import classNames from "classnames";
import { t } from "i18next";
import { useEffect, useMemo, useState } from "react";
import { type SeatCountView, tallyRevealedSeats } from "@/shared/domain";
import type { RawParty } from "@/shared/types";
import { Button } from "../../../../../../../shared/ui/Button";

const REVEAL_INTERVAL_MS = 450;

export function SeatCountScreen({
  view,
  parties,
  year,
  onComplete,
}: {
  view: SeatCountView;
  parties: RawParty[];
  year?: string;
  onComplete: () => void;
}) {
  const [revealed, setRevealed] = useState(0);
  const done = revealed >= view.regions.length;

  useEffect(() => {
    if (done) {
      return;
    }
    const timer = setTimeout(
      () => setRevealed((value) => value + 1),
      REVEAL_INTERVAL_MS,
    );
    return () => clearTimeout(timer);
  }, [revealed, done]);

  const tally = useMemo(
    () => tallyRevealedSeats(view, revealed),
    [view, revealed],
  );
  const colorOf = (party: string) =>
    parties.find((p) => p.id === party)?.color ?? "#64748b";
  const nameOf = (party: string) =>
    parties.find((p) => p.id === party)?.name ?? party;

  return (
    <div className="flex w-full flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-red-400">
              {!done && (
                <span
                  aria-hidden="true"
                  className="size-2 animate-pulse rounded-full bg-red-500"
                />
              )}
              {done ? t("seatCount.final") : t("seatCount.live")}
            </span>
            <h1 className="m-0 text-2xl font-extrabold text-slate-50 md:text-3xl">
              {t("seatCount.title", { year: year ?? "" })}
            </h1>
          </div>
          <span aria-live="polite" className="text-sm font-bold text-blue-200">
            {t("seatCount.progress", {
              done: Math.min(revealed, view.regions.length),
              total: view.regions.length,
            })}
          </span>
        </div>

        <ol className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
          {view.regions.map((region, index) => {
            const isIn = index < revealed;
            return (
              <li
                key={region.id}
                aria-label={
                  isIn
                    ? `${region.name}: ${region.dots.length} / ${region.seats}`
                    : `${region.name}: ${t("seatCount.counting")}`
                }
                className={classNames(
                  "flex min-h-[112px] flex-col gap-2 rounded-[10px] p-3",
                  isIn
                    ? "bg-blue-400/8 shadow-[inset_0_0_0_1px_rgba(239,246,255,0.12)]"
                    : "text-slate-500 shadow-[inset_0_0_0_1px_rgba(239,246,255,0.06)]",
                )}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span
                    className={classNames(
                      "text-sm font-bold",
                      isIn ? "text-slate-50" : "text-slate-500",
                    )}
                  >
                    {region.name}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {region.seats}
                  </span>
                </span>
                {isIn ? (
                  <span aria-hidden="true" className="flex flex-wrap gap-1">
                    {region.dots.map((party, i) => (
                      <span
                        key={i}
                        className="size-3 rounded-full"
                        style={{ backgroundColor: colorOf(party) }}
                      />
                    ))}
                  </span>
                ) : (
                  <span className="text-xs">{t("seatCount.counting")}</span>
                )}
              </li>
            );
          })}
        </ol>

        <section
          aria-label={t("seatCount.tally")}
          className="flex flex-col gap-3 rounded-xl bg-blue-400/8 p-4 shadow-[inset_0_0_0_1px_rgba(239,246,255,0.12)]"
        >
          <span className="text-xs font-bold uppercase tracking-[0.06em] text-blue-200">
            {t("seatCount.tally")}
          </span>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {view.parties.map(({ party }) => (
              <li
                key={party}
                className="grid grid-cols-[140px_1fr_40px] items-center gap-3"
              >
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-100">
                  <span
                    aria-hidden="true"
                    className="size-3 flex-none rounded-full"
                    style={{ backgroundColor: colorOf(party) }}
                  />
                  <span className="truncate">{nameOf(party)}</span>
                </span>
                <span className="relative h-2.5 rounded-full bg-slate-400/15">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300"
                    style={{
                      width: `${((tally[party] ?? 0) / view.allSeats) * 100}%`,
                      backgroundColor: colorOf(party),
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -inset-y-1 w-0.5 bg-slate-50"
                    style={{
                      left: `${(view.majority / view.allSeats) * 100}%`,
                    }}
                  />
                </span>
                <span className="text-right text-sm font-bold text-slate-50">
                  {tally[party] ?? 0}
                </span>
              </li>
            ))}
          </ul>
          <span className="text-xs text-slate-400">
            {t("seatCount.majority", { majority: view.majority })}
            {" · "}
            {done
              ? t("seatCount.nationalAdded", { seats: view.nationalSeats })
              : t("seatCount.nationalPending", { seats: view.nationalSeats })}
          </span>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-slate-400">{t("seatCount.hint")}</span>
          <Button
            onClick={done ? onComplete : () => setRevealed(view.regions.length)}
            variant={done ? "primary" : "tertiary"}
            testId="seatCountContinue"
          >
            <Button.Text>
              {done ? t("seatCount.continue") : t("seatCount.skip")}
            </Button.Text>
          </Button>
        </div>
      </div>
    </div>
  );
}
