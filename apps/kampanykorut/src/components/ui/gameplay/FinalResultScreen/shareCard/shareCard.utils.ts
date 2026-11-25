import type { CampaignOutcome } from "@logic/infra/posthog/events";
import {
  buildFinalOutcome,
  forPlayerSide,
  getEndResultStory,
  getMajorityType,
  getParliamentaryConfig,
} from "@shared/domain";
import type {
  CampaignConfig,
  CampaignState,
  FinalResults,
  HistoryItem,
} from "@shared/types";
import type { TFunction } from "i18next";
import { getMayoralHeadline } from "../mayoralResult.utils";

export const SHARE_CARD_WIDTH = 1200;
export const SHARE_CARD_HEIGHT = 630;

const DEADLOCK_COLOR = "#e0a23b";
const FALLBACK_COLOR = "#67d6f7";

type Translate = TFunction;

export interface ShareCardSeat {
  color: string;
  seats: number;
}

export interface ShareCardBar {
  color: string;
  share: number;
}

export interface ShareCardData {
  outcome: CampaignOutcome;
  accent: string;
  kicker: string;
  title: string;
  imageUri?: string;
  campaignLabel: string;
  electionLabel: string;
  playerLabel: string;
  candidateName: string;
  partyName: string;
  partyColor: string;
  metricLabel: string;
  metricValue: string;
  metricSuffix?: string;
  winnerLabel: string;
  winnerValue: string;
  winnerColor: string;
  turnsLabel: string;
  turns: number;
  seats?: ShareCardSeat[];
  majority?: number;
  bars?: ShareCardBar[];
  cta: string;
  ctaButton: string;
  displayUrl: string;
  shareText: string;
  fileName: string;
}

export interface ShareCardInput {
  results: FinalResults;
  config: CampaignConfig;
  state: CampaignState;
  history: HistoryItem[];
  campaignId: string;
  origin: string;
  locale: string;
  t: Translate;
}

export function formatPercent(share: number, locale: string) {
  return `${(share * 100).toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function storyToOutcome(
  story: "playerSideVictory" | "playerSideDefeat" | "deadlock",
): CampaignOutcome {
  if (story === "playerSideVictory") return "win";
  if (story === "playerSideDefeat") return "loss";
  return "deadlock";
}

const outcomeToStory = {
  win: "playerSideVictory",
  loss: "playerSideDefeat",
  deadlock: "deadlock",
} as const;

export function buildShareCard({
  results,
  config,
  state,
  history,
  campaignId,
  origin,
  locale,
  t,
}: ShareCardInput): ShareCardData {
  const electionConfig = config.electionConfig;
  const parties = electionConfig.parties;
  const partyById = (id?: string) => parties.find((p) => p.id === id);
  const playerPartyId = state.playerSide?.partyId;
  const playerCandidateId = state.playerSide?.candidateId;
  const side = electionConfig.playableSides.find((s) => s.id === playerPartyId);
  const candidateLabel = side?.mainCandidates.find(
    (c) => c.id === playerCandidateId,
  )?.label;
  const endResults =
    playerPartyId && playerCandidateId
      ? config.playableSides?.[playerPartyId]?.[playerCandidateId]?.endResults
      : undefined;

  const mayoral = results.mayoralResult;
  const base = mayoral
    ? buildMayoral(results, playerCandidateId, partyById, locale, t)
    : buildParliamentary(
        results,
        config,
        state,
        history,
        playerPartyId,
        partyById,
        t,
      );

  const playerParty = mayoral
    ? partyById(playerCandidateId)
    : partyById(playerPartyId);
  const partyColor = playerParty?.color ?? FALLBACK_COLOR;
  const accent =
    base.outcome === "win"
      ? partyColor
      : base.outcome === "loss"
        ? base.winnerColor
        : DEADLOCK_COLOR;
  const asset = endResults?.[outcomeToStory[base.outcome]];
  const campaignTitle = electionConfig.title;

  return {
    ...base,
    accent,
    kicker: t(`endResult.share.card.kicker.${base.outcome}`),
    title: asset?.title ?? t(`endResult.share.card.title.${base.outcome}`),
    imageUri: asset?.imageUri || undefined,
    campaignLabel: [electionConfig.year, campaignTitle]
      .filter(Boolean)
      .join(" · "),
    electionLabel: t(
      mayoral
        ? "endResult.share.card.election.mayoral"
        : "endResult.share.card.election.parliamentary",
    ),
    playerLabel: t("endResult.share.card.player"),
    candidateName:
      candidateLabel ?? playerParty?.leader ?? playerParty?.name ?? "",
    partyName: side?.label ?? playerParty?.name ?? "",
    partyColor,
    turnsLabel: t("endResult.share.card.turns"),
    turns: state.turn,
    cta: t(`endResult.share.card.cta.${base.outcome}`),
    ctaButton: t("endResult.share.card.ctaButton"),
    displayUrl: new URL(origin).host.replace(/^www\./, ""),
    shareText: t(`endResult.share.text.${base.outcome}`, {
      metric: base.shareMetric,
      campaign: campaignTitle,
      article: hungarianArticle(campaignTitle),
    }),
    fileName: `kampanykorut-${slugify(campaignId)}-${base.outcome}.png`,
  };
}

type PartyLookup = (
  id?: string,
) => { name: string; color: string; shortName?: string } | undefined;

interface ModeResult {
  outcome: CampaignOutcome;
  metricLabel: string;
  metricValue: string;
  metricSuffix?: string;
  winnerLabel: string;
  winnerValue: string;
  winnerColor: string;
  seats?: ShareCardSeat[];
  majority?: number;
  bars?: ShareCardBar[];
  shareMetric: string;
}

function buildParliamentary(
  results: FinalResults,
  config: CampaignConfig,
  state: CampaignState,
  history: HistoryItem[],
  playerPartyId: string | undefined,
  partyById: PartyLookup,
  t: Translate,
): ModeResult {
  const mandates = results.mandates.filter((m) => !m.party.startsWith("_"));
  const winner = mandates.reduce((max, current) =>
    current.totalSeats > max.totalSeats ? current : max,
  );
  const sideConfig = forPlayerSide(config, state.playerSide);
  const allSeats =
    getParliamentaryConfig(config.electionConfig)?.allSeats ??
    mandates.reduce((sum, m) => sum + m.totalSeats, 0);
  const noWinner = getMajorityType(winner.totalSeats, allSeats) === null;
  const finalOutcome = buildFinalOutcome(state, sideConfig, history);
  const outcome = storyToOutcome(
    getEndResultStory(
      finalOutcome?.outcome,
      winner.party === playerPartyId,
      noWinner,
      config.electionConfig.allowDeadlock,
    ),
  );
  const playerSeats =
    mandates.find((m) => m.party === playerPartyId)?.totalSeats ?? 0;
  const winnerParty = partyById(winner.party);

  return {
    outcome,
    metricLabel: t("endResult.share.card.seats"),
    metricValue: String(playerSeats),
    metricSuffix: `/ ${allSeats}`,
    winnerLabel: t(
      noWinner ? "endResult.share.card.leader" : "endResult.share.card.winner",
    ),
    winnerValue: t("endResult.share.card.winnerSeats", {
      name: winnerParty?.shortName ?? winnerParty?.name ?? winner.party,
      count: winner.totalSeats,
    }),
    winnerColor: winnerParty?.color ?? FALLBACK_COLOR,
    seats: [...mandates]
      .sort((a, b) => b.totalSeats - a.totalSeats)
      .map((m) => ({
        color: partyById(m.party)?.color ?? "#94a3b8",
        seats: m.totalSeats,
      })),
    majority: Math.floor(allSeats / 2) + 1,
    shareMetric: t("endResult.share.metric.seats", { count: playerSeats }),
  };
}

function buildMayoral(
  results: FinalResults,
  playerCandidateId: string | undefined,
  partyById: PartyLookup,
  locale: string,
  t: Translate,
): ModeResult {
  const mayoral = results.mayoralResult!;
  const headline = getMayoralHeadline(mayoral.outcome, playerCandidateId);
  const outcome: CampaignOutcome =
    headline === "victory"
      ? "win"
      : headline === "defeat"
        ? "loss"
        : "deadlock";
  const playerShare =
    mayoral.standings.find((s) => s.candidateId === playerCandidateId)?.share ??
    0;
  const leader = mayoral.standings[0];
  const leaderParty = partyById(leader?.candidateId);

  return {
    outcome,
    metricLabel: t("endResult.share.card.votes"),
    metricValue: formatPercent(playerShare, locale),
    winnerLabel: t(
      mayoral.outcome.kind === "winner"
        ? "endResult.share.card.winner"
        : "endResult.share.card.leader",
    ),
    winnerValue: `${leaderParty?.name ?? leader?.candidateId ?? "–"} · ${formatPercent(leader?.share ?? 0, locale)}`,
    winnerColor: leaderParty?.color ?? FALLBACK_COLOR,
    bars: mayoral.standings.slice(0, 4).map((s) => ({
      color: partyById(s.candidateId)?.color ?? "#94a3b8",
      share: s.share,
    })),
    shareMetric: t("endResult.share.metric.votes", {
      share: formatPercent(playerShare, locale),
    }),
  };
}

export function hungarianArticle(word: string) {
  const first = word.trim().toLowerCase();
  if (/^[aáeéiíoóöőuúüű]/.test(first)) return "az";
  const digits = /^\d+/.exec(first)?.[0];
  if (!digits) return "a";
  if (digits[0] === "5") return "az";
  return digits[0] === "1" && [1, 4, 7].includes(digits.length) ? "az" : "a";
}

function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "kampany"
  );
}
