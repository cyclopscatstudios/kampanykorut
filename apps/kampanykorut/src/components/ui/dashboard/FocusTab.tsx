import classNames from "classnames";
import { t } from "i18next";
import type { FocusOverview, FocusView } from "@/shared/domain";
import { Button } from "../../../../../../shared/ui/Button";
import { HoverDetail } from "./DashboardTile";
import { FocusEmblem } from "./FocusEmblem";
import { focusStatusStyle } from "./focusStatusStyle";

export function FocusTab({
  overview,
  onSelect,
}: {
  overview: FocusOverview;
  onSelect: (focusId: string) => void;
}) {
  return (
    <section
      aria-label={t("politicalDashboard.tabs.focuses")}
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {overview.focuses.map((focus) => (
          <FocusCard key={focus.id} focus={focus} onSelect={onSelect} />
        ))}
      </div>
      <p className="m-0 text-center text-sm text-slate-400">
        {overview.locked
          ? t("politicalDashboard.focus.lockedNote")
          : t("politicalDashboard.focus.switchNote")}
      </p>
    </section>
  );
}

function FocusCard({
  focus,
  onSelect,
}: {
  focus: FocusView;
  onSelect: (focusId: string) => void;
}) {
  const style = focusStatusStyle[focus.status];

  return (
    <div className="flex flex-col gap-3">
      <HoverDetail id={`focus-${focus.id}`} detail={focus.description}>
        <article
          aria-label={focus.title}
          className={classNames(
            "flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl p-6 text-center",
            style.card,
          )}
        >
          <FocusEmblem focus={focus} />
          <span className="text-xl font-bold text-slate-50">{focus.title}</span>
          <span className="text-sm text-slate-300">{focus.summary}</span>
          <span className={classNames("text-sm font-bold", style.word)}>
            {t(`politicalDashboard.focus.status.${focus.status}`)}
          </span>
        </article>
      </HoverDetail>
      {focus.selectable && (
        <Button
          variant="secondary"
          block
          onClick={() => onSelect(focus.id)}
          testId={`selectFocus-${focus.id}`}
        >
          <Button.Icon name="flag-fill" />
          <Button.Text>{t("politicalDashboard.focus.select")}</Button.Text>
        </Button>
      )}
    </div>
  );
}
