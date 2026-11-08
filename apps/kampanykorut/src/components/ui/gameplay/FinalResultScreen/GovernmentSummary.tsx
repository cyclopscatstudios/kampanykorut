import classNames from "classnames";
import type { FinalOutcome } from "@/shared/domain";
import type { BootstrapIcon, GovernmentOutcome } from "@/shared/types";
import { useTranslate } from "../../../../../../../shared/logic/hooks/useTranslateLang";
import { Icon } from "../../../../../../../shared/ui/Icon";

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

export function GovernmentOutcomeBadge({ outcome }: { outcome: FinalOutcome }) {
  const t = useTranslate();
  const style = outcomeStyle[outcome.outcome];

  return (
    <div
      data-testid="governmentSummary"
      className={classNames(
        "flex items-center gap-3 rounded-xl px-4 py-3",
        style.className,
      )}
    >
      <Icon name={style.icon} size={28} color="currentColor" />
      <span className="flex min-w-0 flex-col">
        <span className="text-xs font-bold uppercase tracking-[0.06em] text-blue-200">
          {t("endResult.government.label")}
        </span>
        <span className="text-lg font-extrabold text-slate-50">
          {t(`endResult.government.${outcome.outcome}`)}
        </span>
      </span>
      <span className="ml-auto text-sm font-semibold">
        {t("endResult.government.seats", {
          seats: outcome.governmentSeats,
          majority: outcome.majority,
        })}
      </span>
    </div>
  );
}

export function EpilogueCard({
  epilogue,
}: {
  epilogue: NonNullable<FinalOutcome["epilogue"]>;
}) {
  const t = useTranslate();

  return (
    <article
      aria-label={t("endResult.epilogue")}
      className="flex gap-3 rounded-xl bg-blue-400/8 p-4 shadow-[inset_0_0_0_1px_rgba(239,246,255,0.12)]"
    >
      <span
        aria-hidden="true"
        className="inline-flex size-10 flex-none items-center justify-center rounded-full bg-[#e0a23b]/15 text-[#e0a23b]"
      >
        <Icon
          name={epilogue.icon ?? "book-half"}
          size={18}
          color="currentColor"
        />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-[0.06em] text-blue-200">
          {t("endResult.epilogue")}
        </span>
        <span className="text-base font-bold text-slate-50">
          {epilogue.title}
        </span>
        <span className="text-sm leading-relaxed text-slate-300">
          {epilogue.body}
        </span>
      </span>
    </article>
  );
}
