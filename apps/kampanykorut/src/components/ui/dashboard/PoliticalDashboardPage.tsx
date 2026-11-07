import { t } from "i18next";
import { useEffect, useMemo, useState } from "react";
import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";
import {
  buildDashboardOverview,
  buildFocusOverview,
  getFocuses,
  markPublicEventsSeen,
  selectFocus,
} from "@/shared/domain";
import { CampaignState } from "@/shared/types";
import { Button } from "../../../../../../shared/ui/Button";
import { useNavigation } from "../../../hooks/navigationHook";
import { useParams } from "../../../hooks/useParamsHook";
import { getCampaignBadgeInfo } from "../gameplay/campaignBadge.utils";
import { GameChrome } from "../gameplay/GameChrome";
import { FocusTab } from "./FocusTab";
import { OverviewTab } from "./OverviewTab";

type DashboardTab = "overview" | "focuses";

export function PoliticalDashboardPage() {
  const { campaignId = "" } = useParams();
  const stateEngine = container.resolve(StateEngine);
  const config = container.resolve(ConfigEngine).getCampaignConfig(campaignId);
  const { goToCampaign } = useNavigation();
  const [stored] = useState(() => stateEngine.getCampaignState());
  // Opening the dashboard is what counts as seeing the public events.
  const [state, setState] = useState<CampaignState | null>(() =>
    stored ? markPublicEventsSeen(stored, config.campaignEvents) : null,
  );
  const [tab, setTab] = useState<DashboardTab>("overview");
  const hasFocuses = getFocuses(config).length > 0;

  const overview = useMemo(
    () => (state ? buildDashboardOverview(state, config) : undefined),
    [state, config],
  );
  const focusOverview = useMemo(
    () =>
      state && hasFocuses
        ? buildFocusOverview(state, config, stateEngine.getHistory() ?? [])
        : undefined,
    [state, config, hasFocuses, stateEngine],
  );

  useEffect(() => {
    if (state && state.politicalDashboard !== stored?.politicalDashboard) {
      stateEngine.updateCampaignState({
        politicalDashboard: state.politicalDashboard,
      });
    }
  }, [state, stored, stateEngine]);

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

          {hasFocuses && (
            <div role="tablist" className="flex gap-2">
              {(["overview", "focuses"] as const).map((id) => (
                <Button
                  key={id}
                  variant="tab"
                  role="tab"
                  aria-selected={tab === id}
                  selected={tab === id}
                  onClick={() => setTab(id)}
                  testId={`dashboardTab-${id}`}
                >
                  <Button.Text>
                    {t(`politicalDashboard.tabs.${id}`)}
                  </Button.Text>
                </Button>
              ))}
            </div>
          )}

          {tab === "focuses" && focusOverview ? (
            <FocusTab
              overview={focusOverview}
              onSelect={(focusId) =>
                setState(selectFocus(state, config, focusId))
              }
            />
          ) : (
            <OverviewTab
              overview={overview}
              focus={focusOverview}
              onOpenFocuses={() => setTab("focuses")}
            />
          )}
        </div>
      </div>
    </GameChrome>
  );
}
