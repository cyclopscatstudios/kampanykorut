import type { FocusView } from "@/shared/domain";
import { useTranslate } from "../../../../../../../../shared/logic/hooks/useTranslateLang";
import { Tooltip } from "../../../../../../../../shared/ui/Tooltip";
import { FocusEmblem } from "../../../dashboard/FocusEmblem";

export function FocusResult({ focuses }: { focuses: FocusView[] }) {
  const t = useTranslate();

  if (focuses.length === 0) {
    return (
      <section
        data-testid="focusResult"
        aria-label={t("endResult.focus.label")}
        className="mb-4 flex items-center gap-4 rounded-xl bg-blue-400/8 p-4 shadow-[inset_0_0_0_1px_rgba(239,246,255,0.12)]"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-xs font-bold uppercase tracking-[0.06em] text-blue-200">
            {t("endResult.focus.label")}
          </span>
          <span className="text-sm text-slate-400">
            {t("endResult.focus.none")}
          </span>
        </span>
      </section>
    );
  }

  return (
    <section
      data-testid="focusResult"
      aria-label={t("endResult.focus.label")}
      className="mb-4 flex flex-col gap-3"
    >
      {focuses.map((focus) => (
        <div
          key={focus.id}
          className="flex items-center gap-4 rounded-xl bg-blue-400/8 p-4 shadow-[inset_0_0_0_1px_rgba(239,246,255,0.12)]"
        >
          <Tooltip content={focus.summary} position="right">
            <FocusEmblem focus={focus} />
          </Tooltip>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-blue-200">
              {t("endResult.focus.label")}
            </span>
            <span className="text-lg font-bold text-slate-50">
              {focus.title}
            </span>
            <span className="text-sm text-slate-300">
              {t(`politicalDashboard.focus.status.${focus.status}`)}
            </span>
          </span>
        </div>
      ))}
    </section>
  );
}
