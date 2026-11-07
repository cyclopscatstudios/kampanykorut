import { t } from "i18next";
import { useEffect, useMemo, useState } from "react";
import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";
import {
  buildDashboardOverview,
  markPublicEventsSeen,
  PublicEvent,
} from "@/shared/domain";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { useNavigation } from "../../../hooks/navigationHook";
import { useParams } from "../../../hooks/useParamsHook";
import { getCampaignBadgeInfo } from "../gameplay/campaignBadge.utils";
import { GameChrome } from "../gameplay/GameChrome";

export function PoliticalDashboardPage() {
  const { campaignId = "" } = useParams();
  const stateEngine = container.resolve(StateEngine);
  const config = container.resolve(ConfigEngine).getCampaignConfig(campaignId);
  const { goToCampaign } = useNavigation();
  const [state] = useState(() => stateEngine.getCampaignState());
  const overview = useMemo(
    () => (state ? buildDashboardOverview(state, config) : undefined),
    [state, config],
  );

  useEffect(() => {
    if (!state) {
      return;
    }
    const seen = markPublicEventsSeen(state, config.campaignEvents);
    if (seen !== state) {
      stateEngine.updateCampaignState({
        politicalDashboard: seen.politicalDashboard,
      });
    }
  }, [state, config, stateEngine]);

  if (!state || !overview) {
    return null;
  }

  const { year, partyName } = getCampaignBadgeInfo(state, config, undefined);
  const context = [
    year,
    partyName,
    t("politicalDashboard.turn", { turn: overview.turn }),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <GameChrome state={state} config={config}>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 py-6 md:px-10 md:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-blue-200">
                {context}
              </span>
              <h1 className="m-0 text-3xl font-extrabold tracking-tight text-slate-50 md:text-4xl">
                {t("politicalDashboard.title")}
              </h1>
            </div>
            <Button
              variant="secondary"
              onClick={() =>
                goToCampaign(campaignId, stateEngine.getSessionId())
              }
              testId="politicalDashboardBack"
            >
              <Button.Icon name="arrow-left" />
              <Button.Text>{t("politicalDashboard.back")}</Button.Text>
            </Button>
          </div>

          <section
            aria-label={t("politicalDashboard.overview")}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <TurnTile turn={overview.turn} totalTurns={overview.totalTurns} />
            {overview.latestEvent ? (
              <EventTile event={overview.latestEvent} />
            ) : (
              <EmptyTile />
            )}
          </section>
        </div>
      </div>
    </GameChrome>
  );
}

function Tile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <article
      aria-label={label}
      className="relative flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl bg-blue-400/8 p-6 text-center shadow-[inset_0_0_0_1px_rgba(239,246,255,0.12)]"
    >
      <span className="text-xs font-bold uppercase tracking-[0.06em] text-blue-200">
        {label}
      </span>
      {children}
    </article>
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
  const [open, setOpen] = useState(false);

  return (
    <div
      tabIndex={0}
      aria-describedby={`event-${event.id}-detail`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((value) => !value)}
      className="relative rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      <Tile label={t("politicalDashboard.latestEvent")}>
        <span
          aria-hidden="true"
          className="inline-flex size-[72px] items-center justify-center rounded-full bg-amber-400/12 text-amber-400 shadow-[inset_0_0_0_2px_currentColor]"
        >
          <Icon name="megaphone-fill" size={30} color="currentColor" />
        </span>
        <span className="text-xl font-bold text-slate-50">{event.title}</span>
      </Tile>
      <div
        id={`event-${event.id}-detail`}
        role="tooltip"
        className={
          open
            ? "pointer-events-none absolute inset-0 flex items-center rounded-xl bg-[#161e30] p-6 text-left shadow-[inset_0_0_0_1px_#4462aa]"
            : "sr-only"
        }
      >
        <p className="m-0 text-sm leading-[21px] text-slate-100">
          {event.body}
        </p>
      </div>
    </div>
  );
}

function EmptyTile() {
  return (
    <Tile label={t("politicalDashboard.latestEvent")}>
      <span
        aria-hidden="true"
        className="inline-flex size-[72px] items-center justify-center rounded-full bg-slate-400/8 text-slate-400 shadow-[inset_0_0_0_2px_rgba(148,163,184,0.4)]"
      >
        <Icon name="moon-stars" size={30} color="currentColor" />
      </span>
      <span className="text-xl font-bold text-slate-50">
        {t("politicalDashboard.empty.title")}
      </span>
      <span className="text-sm text-slate-400">
        {t("politicalDashboard.empty.body")}
      </span>
    </Tile>
  );
}
