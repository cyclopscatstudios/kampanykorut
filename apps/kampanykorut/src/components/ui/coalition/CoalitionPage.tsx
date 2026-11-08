import classNames from "classnames";
import { t } from "i18next";
import { useMemo, useState } from "react";
import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";
import {
  buildCoalitionResult,
  buildCoalitionView,
  type CoalitionResponseView,
  type SeatParty,
  submitCoalitionOffer,
} from "@/shared/domain";
import { CampaignState, GovernmentOutcome } from "@/shared/types";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { useNavigation } from "../../../hooks/navigationHook";
import { useParams } from "../../../hooks/useParamsHook";
import { GameChrome } from "../gameplay/GameChrome";
import { SeatBar } from "./SeatBar";

export function CoalitionPage() {
  const { campaignId = "" } = useParams();
  const stateEngine = container.resolve(StateEngine);
  const config = container.resolve(ConfigEngine).getCampaignConfig(campaignId);
  const { goToFinalResults } = useNavigation();
  const [state, setState] = useState<CampaignState | null>(() =>
    stateEngine.getCampaignState(),
  );
  const [offered, setOffered] = useState<string[]>([]);

  const view = useMemo(
    () => (state ? buildCoalitionView(state, config) : undefined),
    [state, config],
  );
  const result = useMemo(
    () => (state ? buildCoalitionResult(state, config) : undefined),
    [state, config],
  );

  if (!state || !view) {
    return null;
  }

  const toggle = (partyId: string) =>
    setOffered((ids) =>
      ids.includes(partyId)
        ? ids.filter((id) => id !== partyId)
        : [...ids, partyId],
    );

  const submit = () => {
    const next = submitCoalitionOffer(
      state,
      config,
      stateEngine.getHistory() ?? [],
      offered,
    );
    stateEngine.updateCampaignState({ coalition: next.coalition });
    setState(next);
  };

  const barParties: (SeatParty & { pending?: boolean })[] = result
    ? [view.player, ...result.responses.filter((r) => r.accepted)]
    : [
        view.player,
        ...view.partners
          .filter((p) => offered.includes(p.partyId))
          .map((p) => ({ ...p, pending: true })),
      ];
  const seats = barParties.reduce((sum, p) => sum + p.seats, 0);

  return (
    <GameChrome state={state} config={config}>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6 px-4 py-6 md:px-10 md:py-10">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-blue-200">
              {t("coalition.kicker")}
            </span>
            <h1 className="m-0 text-3xl font-extrabold tracking-tight text-slate-50 md:text-4xl">
              {t(result ? "coalition.resultTitle" : "coalition.title")}
            </h1>
            {!result && (
              <p className="m-0 text-sm text-slate-400">
                {t("coalition.subtitle", {
                  seats: view.player.seats,
                  majority: view.majority,
                })}
              </p>
            )}
          </div>

          <SeatBar
            parties={barParties}
            allSeats={view.allSeats}
            majority={view.majority}
            seats={seats}
            label={t(
              result ? "coalition.governmentSeats" : "coalition.potential",
            )}
            hint={result ? undefined : t("coalition.potentialHint")}
          />

          {result && <Outcome outcome={result.outcome} />}

          <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {(result ? result.responses : view.partners).map((party) => (
              <li key={party.partyId}>
                {result ? (
                  <ResponseCard response={party as CoalitionResponseView} />
                ) : (
                  <PartnerCard
                    party={party}
                    selected={offered.includes(party.partyId)}
                    onToggle={() => toggle(party.partyId)}
                  />
                )}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {result ? (
              <Button
                onClick={() =>
                  goToFinalResults(campaignId, stateEngine.getSessionId())
                }
                testId="coalitionContinue"
              >
                <Button.Text>{t("coalition.continue")}</Button.Text>
                <Button.Icon name="arrow-right" />
              </Button>
            ) : (
              <Button
                onClick={submit}
                disabled={offered.length === 0}
                testId="coalitionSubmit"
              >
                <Button.Icon name="send-fill" />
                <Button.Text>
                  {t("coalition.submit", { parties: offered.length })}
                </Button.Text>
              </Button>
            )}
          </div>
        </div>
      </div>
    </GameChrome>
  );
}

function PartyDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-4 flex-none rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function PartnerCard({
  party,
  selected,
  onToggle,
}: {
  party: SeatParty;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      data-testid={`coalitionPartner-${party.partyId}`}
      className={classNames(
        "flex w-full cursor-pointer items-center gap-3 rounded-xl p-4 text-left transition-[box-shadow,background] duration-150",
        selected
          ? "bg-blue-400/15 shadow-[inset_0_0_0_2px_#60a5fa]"
          : "bg-blue-400/8 shadow-[inset_0_0_0_1px_rgba(239,246,255,0.12)] hover:bg-blue-400/12",
      )}
    >
      <PartyDot color={party.color} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-base font-bold text-slate-50">
          {party.name}
        </span>
        <span className="text-xs font-semibold text-slate-400">
          {t("coalition.seats", { seats: party.seats })}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={classNames(
          "inline-flex size-7 items-center justify-center rounded-full",
          selected
            ? "bg-blue-500 text-white"
            : "bg-slate-400/15 text-slate-400",
        )}
      >
        <Icon name={selected ? "check-lg" : "plus-lg"} size={14} />
      </span>
    </button>
  );
}

function ResponseCard({ response }: { response: CoalitionResponseView }) {
  return (
    <div
      data-testid={`coalitionResponse-${response.partyId}`}
      className={classNames(
        "flex h-full flex-col gap-2 rounded-xl p-4",
        response.accepted
          ? "bg-green-400/8 shadow-[inset_0_0_0_2px_#4ade80]"
          : "bg-red-400/8 shadow-[inset_0_0_0_2px_#f87171]",
      )}
    >
      <span className="flex items-center gap-3">
        <PartyDot color={response.color} />
        <span className="flex-1 truncate text-base font-bold text-slate-50">
          {response.name}
        </span>
        <span
          className={classNames(
            "inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.06em]",
            response.accepted ? "text-green-300" : "text-red-300",
          )}
        >
          <Icon
            name={response.accepted ? "check-circle-fill" : "x-circle-fill"}
            size={14}
          />
          {t(response.accepted ? "coalition.accepted" : "coalition.rejected")}
        </span>
      </span>
      {response.reason && (
        <span className="text-sm text-slate-300">{response.reason}</span>
      )}
    </div>
  );
}

function Outcome({ outcome }: { outcome: GovernmentOutcome }) {
  const success = outcome === "coalition";
  return (
    <div
      role="status"
      className={classNames(
        "flex items-center gap-3 rounded-xl px-4 py-3",
        success
          ? "bg-green-400/8 text-green-200"
          : "bg-amber-400/8 text-amber-200",
      )}
    >
      <Icon name={success ? "bank2" : "exclamation-triangle-fill"} size={22} />
      <span className="text-lg font-bold">
        {t(`endResult.government.${outcome}`)}
      </span>
    </div>
  );
}
