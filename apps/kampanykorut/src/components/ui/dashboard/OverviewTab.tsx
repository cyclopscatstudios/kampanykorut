import { t } from "i18next";
import type {
  DashboardOverview,
  FocusOverview,
  PublicEvent,
} from "@/shared/domain";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Emblem, HoverDetail, Tile } from "./DashboardTile";
import { FocusEmblem } from "./FocusEmblem";
import { focusStatusStyle } from "./focusStatusStyle";

export function OverviewTab({
  overview,
  focus,
  onOpenFocuses,
}: {
  overview: DashboardOverview;
  focus?: FocusOverview;
  onOpenFocuses: () => void;
}) {
  return (
    <section
      aria-label={t("politicalDashboard.tabs.overview")}
      className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
    >
      {focus && focus.focuses.length > 0 && (
        <FocusTile focus={focus} onOpenFocuses={onOpenFocuses} />
      )}
      <TurnTile turn={overview.turn} totalTurns={overview.totalTurns} />
      {overview.latestEvent ? (
        <EventTile event={overview.latestEvent} />
      ) : (
        <EmptyTile />
      )}
    </section>
  );
}

function FocusTile({
  focus,
  onOpenFocuses,
}: {
  focus: FocusOverview;
  onOpenFocuses: () => void;
}) {
  const selected = focus.selected;
  if (!selected) {
    return (
      <Tile label={t("politicalDashboard.focus.followed")}>
        <Emblem className="bg-slate-400/8 text-slate-300 outline-2 outline-dashed outline-slate-500">
          <Icon name="signpost-split-fill" size={30} color="currentColor" />
        </Emblem>
        <span className="text-xl font-bold text-slate-50">
          {t("politicalDashboard.focus.prompt")}
        </span>
        <Button variant="secondary" size="sm" onClick={onOpenFocuses}>
          <Button.Text>{t("politicalDashboard.focus.choose")}</Button.Text>
        </Button>
      </Tile>
    );
  }

  const style = focusStatusStyle[selected.status];
  return (
    <HoverDetail
      id={`overview-focus-${selected.id}`}
      detail={selected.description}
    >
      <Tile
        label={t("politicalDashboard.focus.followed")}
        className={style.card}
      >
        <FocusEmblem focus={selected} />
        <span className="text-xl font-bold text-slate-50">
          {selected.title}
        </span>
        <span className={`text-sm font-bold ${style.word}`}>
          {t(`politicalDashboard.focus.status.${selected.status}`)}
        </span>
      </Tile>
    </HoverDetail>
  );
}

function TurnTile({ turn, totalTurns }: { turn: number; totalTurns: number }) {
  return (
    <Tile label={t("politicalDashboard.progress")}>
      <span className="text-4xl font-extrabold text-slate-50">
        {turn}
        <span className="text-base font-semibold text-slate-400">
          {` / ${totalTurns}`}
        </span>
      </span>
      {totalTurns > 0 && (
        <span
          aria-hidden="true"
          className="flex flex-wrap justify-center gap-1"
        >
          {Array.from({ length: totalTurns }, (_, i) => (
            <span
              key={i}
              className={
                i < turn
                  ? "h-1.5 w-4 rounded-full bg-blue-400"
                  : "h-1.5 w-4 rounded-full bg-slate-400/25"
              }
            />
          ))}
        </span>
      )}
    </Tile>
  );
}

function EventTile({ event }: { event: PublicEvent }) {
  return (
    <HoverDetail id={`event-${event.id}`} detail={event.body}>
      <Tile label={t("politicalDashboard.latestEvent")}>
        <Emblem className="bg-amber-400/12 text-amber-400 shadow-[inset_0_0_0_2px_currentColor]">
          <Icon name="megaphone-fill" size={30} color="currentColor" />
        </Emblem>
        <span className="text-xl font-bold text-slate-50">{event.title}</span>
      </Tile>
    </HoverDetail>
  );
}

function EmptyTile() {
  return (
    <Tile label={t("politicalDashboard.latestEvent")}>
      <Emblem className="bg-slate-400/8 text-slate-400 shadow-[inset_0_0_0_2px_rgba(148,163,184,0.4)]">
        <Icon name="moon-stars" size={30} color="currentColor" />
      </Emblem>
      <span className="text-xl font-bold text-slate-50">
        {t("politicalDashboard.empty.title")}
      </span>
      <span className="text-sm text-slate-400">
        {t("politicalDashboard.empty.body")}
      </span>
    </Tile>
  );
}
