import classNames from "classnames";
import { t } from "i18next";
import type { PublicEvent } from "@/shared/domain";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Emblem, HoverDetail, Tile } from "./DashboardTile";

export function ChronicleTab({ events }: { events: PublicEvent[] }) {
  if (events.length === 0) {
    return (
      <Tile label={t("politicalDashboard.tabs.chronicle")}>
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

  return (
    <section
      aria-label={t("politicalDashboard.tabs.chronicle")}
      className="relative"
    >
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-[41px] top-0 w-0.5 bg-blue-400/30 md:bottom-auto md:left-0 md:right-0 md:top-[62px] md:h-0.5 md:w-auto"
      />
      <ol className="relative m-0 flex list-none flex-col gap-6 p-0 md:flex-row md:flex-wrap md:items-start md:justify-center md:gap-8">
        {events.map((event) => (
          <li key={event.id} className="md:w-[160px]">
            <ChronicleNode event={event} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function ChronicleNode({ event }: { event: PublicEvent }) {
  const major = Boolean(event.major);

  return (
    <HoverDetail id={`chronicle-${event.id}`} detail={event.body}>
      <div className="flex items-center gap-4 md:flex-col md:gap-3 md:text-center">
        <span
          aria-hidden="true"
          className={classNames(
            "inline-flex flex-none items-center justify-center rounded-full bg-[#0f172a]",
            major
              ? "size-[84px] text-amber-500 shadow-[inset_0_0_0_4px_#e0a23b,inset_0_0_0_200px_rgba(224,162,59,0.12)] md:size-[124px]"
              : "ml-2 size-[68px] text-blue-200 shadow-[inset_0_0_0_2px_#54a2ff,inset_0_0_0_200px_rgba(84,162,255,0.10)] md:ml-0 md:mt-5 md:size-[84px]",
          )}
        >
          <Icon
            name={event.icon ?? (major ? "star-fill" : "circle-fill")}
            size={major ? 36 : 22}
            color="currentColor"
          />
        </span>
        <span className="flex flex-col gap-1">
          {event.turn !== undefined && (
            <span
              className={classNames(
                "text-xs font-bold uppercase tracking-[0.06em]",
                major ? "text-amber-500" : "text-slate-400",
              )}
            >
              {t("politicalDashboard.turn", { turn: event.turn })}
            </span>
          )}
          <span className="text-base font-bold text-slate-50">
            {event.title}
          </span>
        </span>
      </div>
    </HoverDetail>
  );
}
