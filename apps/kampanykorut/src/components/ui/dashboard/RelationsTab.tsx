import classNames from "classnames";
import { t } from "i18next";
import type { RelationGroupView, RelationView } from "@/shared/domain";
import type { BootstrapIcon, RelationTone } from "@/shared/types";
import { Icon } from "../../../../../../shared/ui/Icon";
import { HoverDetail } from "./DashboardTile";

// Tone differs in colour, badge icon and the label word, never colour alone.
const toneStyle: Record<
  RelationTone,
  { ring: string; badgeRing: string; word: string; badge: BootstrapIcon }
> = {
  good: {
    ring: "bg-green-400/12 shadow-[inset_0_0_0_2px_#4ade80]",
    badgeRing: "shadow-[inset_0_0_0_2px_#4ade80]",
    word: "text-green-400",
    badge: "arrow-up-circle-fill",
  },
  calm: {
    ring: "bg-slate-200/8 shadow-[inset_0_0_0_2px_#e2e8f0]",
    badgeRing: "shadow-[inset_0_0_0_2px_#e2e8f0]",
    word: "text-slate-200",
    badge: "dash-circle-fill",
  },
  tense: {
    ring: "bg-yellow-400/12 shadow-[inset_0_0_0_2px_#facc15]",
    badgeRing: "shadow-[inset_0_0_0_2px_#facc15]",
    word: "text-yellow-400",
    badge: "lightning-fill",
  },
  bad: {
    ring: "bg-red-400/12 shadow-[inset_0_0_0_2px_#f87171]",
    badgeRing: "shadow-[inset_0_0_0_2px_#f87171]",
    word: "text-red-400",
    badge: "arrow-down-circle-fill",
  },
};

export function RelationsTab({ groups }: { groups: RelationGroupView[] }) {
  return (
    <section
      aria-label={t("politicalDashboard.tabs.relations")}
      className="flex flex-col gap-8"
    >
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-4">
          <h2 className="m-0 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.06em] text-blue-200">
            {group.icon && (
              <Icon name={group.icon} size={16} color="currentColor" />
            )}
            {group.title}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.relations.map((relation) => (
              <RelationCard key={relation.id} relation={relation} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function RelationCard({ relation }: { relation: RelationView }) {
  const style = toneStyle[relation.tone];

  return (
    <HoverDetail id={`relation-${relation.id}`} detail={relation.description}>
      <article
        aria-label={`${relation.name}: ${relation.label}`}
        className="relative flex min-h-[120px] items-center gap-4 rounded-xl bg-blue-400/8 p-5 shadow-[inset_0_0_0_1px_rgba(239,246,255,0.12)]"
      >
        <span aria-hidden="true" className="relative inline-flex flex-none">
          <span
            className={classNames(
              "inline-flex size-[76px] items-center justify-center rounded-full text-blue-50",
              style.ring,
            )}
          >
            <Icon
              name={relation.icon ?? "person-fill"}
              size={relation.icon?.startsWith("/") ? 76 : 32}
              color="currentColor"
              className="rounded-full"
            />
          </span>
          <span
            className={classNames(
              "absolute -bottom-0.5 -right-0.5 inline-flex size-[26px] items-center justify-center rounded-full bg-[#0f172a]",
              style.word,
              style.badgeRing,
            )}
          >
            <Icon name={style.badge} size={14} color="currentColor" />
          </span>
        </span>
        <span className="flex min-w-0 flex-col gap-1 text-left">
          <span className="text-sm font-semibold text-slate-300">
            {relation.name}
          </span>
          <span
            className={classNames(
              "text-[22px] font-bold leading-7 tracking-tight",
              style.word,
            )}
          >
            {relation.label}
          </span>
        </span>
        {relation.isNew && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-900">
            {t("politicalDashboard.relations.new")}
          </span>
        )}
      </article>
    </HoverDetail>
  );
}
