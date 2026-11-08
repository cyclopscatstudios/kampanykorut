import classNames from "classnames";
import type { FinalOutcome } from "@/shared/domain";
import type { BootstrapIcon, GovernmentOutcome } from "@/shared/types";
import { useTranslate } from "../../../../../../../shared/logic/hooks/useTranslateLang";
import { Icon } from "../../../../../../../shared/ui/Icon";
import { FocusEmblem } from "../../dashboard/FocusEmblem";

const outcomeStyle: Record<
  GovernmentOutcome,
  { icon: BootstrapIcon; className: string }
> = {
  "single-majority": {
    icon: "trophy-fill",
    className: "bg-green-400/8 text-green-200 shadow-[inset_0_0_0_2px_#4ade80]",
  },
  coalition: {
    icon: "bank2",
    className: "bg-green-400/8 text-green-200 shadow-[inset_0_0_0_2px_#4ade80]",
  },
  failed: {
    icon: "exclamation-triangle-fill",
    className: "bg-amber-400/8 text-amber-200 shadow-[inset_0_0_0_2px_#e0a23b]",
  },
  opposition: {
    icon: "door-closed-fill",
    className: "bg-slate-400/8 text-slate-200 shadow-[inset_0_0_0_2px_#64748b]",
  },
};

const cardClass =
  "flex flex-col items-center gap-2 rounded-xl px-4 py-5 text-center";

export function GovernmentSummary({ outcome }: { outcome: FinalOutcome }) {
  const t = useTranslate();
  const style = outcomeStyle[outcome.outcome];

  return (
    <div
      data-testid="governmentSummary"
      className="grid grid-cols-1 gap-3 px-3 pt-5 md:grid-cols-2 md:px-6"
    >
      <div className={classNames(cardClass, style.className)}>
        <Icon name={style.icon} size={32} color="currentColor" />
        <span className="text-xs font-bold uppercase tracking-[0.06em] text-blue-200">
          {t("endResult.government.label")}
        </span>
        <span className="text-xl font-extrabold text-slate-50">
          {t(`endResult.government.${outcome.outcome}`)}
        </span>
        <span className="text-sm font-semibold">
          {t("endResult.government.seats", {
            seats: outcome.governmentSeats,
            majority: outcome.majority,
          })}
        </span>
      </div>

      <div
        className={classNames(
          cardClass,
          "bg-blue-400/8 shadow-[inset_0_0_0_1px_rgba(239,246,255,0.12)]",
        )}
      >
        <span className="text-xs font-bold uppercase tracking-[0.06em] text-blue-200">
          {t("endResult.focus.label")}
        </span>
        {outcome.focus ? (
          <>
            <FocusEmblem focus={outcome.focus} />
            <span className="text-lg font-bold text-slate-50">
              {outcome.focus.title}
            </span>
            <span className="text-sm text-slate-300">
              {t(`politicalDashboard.focus.status.${outcome.focus.status}`)}
            </span>
          </>
        ) : (
          <span className="text-sm text-slate-400">
            {t("endResult.focus.none")}
          </span>
        )}
      </div>

      {outcome.epilogue && (
        <article
          aria-label={t("endResult.epilogue")}
          className="flex gap-4 rounded-xl bg-blue-400/8 p-5 shadow-[inset_0_0_0_1px_rgba(239,246,255,0.12)] md:col-span-2"
        >
          <span
            aria-hidden="true"
            className="inline-flex size-12 flex-none items-center justify-center rounded-full bg-[#e0a23b]/15 text-[#e0a23b]"
          >
            <Icon
              name={outcome.epilogue.icon ?? "book-half"}
              size={22}
              color="currentColor"
            />
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-blue-200">
              {t("endResult.epilogue")}
            </span>
            <span className="text-lg font-bold text-slate-50">
              {outcome.epilogue.title}
            </span>
            <span className="text-sm leading-relaxed text-slate-300">
              {outcome.epilogue.body}
            </span>
          </span>
        </article>
      )}
    </div>
  );
}
