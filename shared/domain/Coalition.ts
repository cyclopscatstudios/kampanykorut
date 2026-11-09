import {
  CampaignConfig,
  CampaignState,
  CoalitionPartner,
  Epilogue,
  GovernmentOutcome,
} from "../types";
import { type Answers, createConditionCheck } from "./ConditionCheck";
import { getParliamentaryConfig } from "./ElectionType";
import { getMajorityThresholds } from "./Majority";
import { isStrategicMode } from "./PoliticalDashboard";
import { isProportionalElection } from "./ProportionalSeatCalculator";

type CoalitionConfig = Pick<
  CampaignConfig,
  "politicalConfig" | "electionConfig"
>;

export interface SeatParty {
  partyId: string;
  name: string;
  color: string;
  seats: number;
}

export interface CoalitionView {
  player: SeatParty;
  partners: SeatParty[];
  allSeats: number;
  majority: number;
}

export interface CoalitionResponseView extends SeatParty {
  accepted: boolean;
  reason: string;
}

export interface CoalitionResult {
  responses: CoalitionResponseView[];
  seats: number;
  majority: number;
  outcome: GovernmentOutcome;
  partnerCount: number;
}

export interface FinalOutcome {
  outcome: GovernmentOutcome;
  playerSeats: number;
  governmentSeats: number;
  majority: number;
  // Partners the player shares power with.
  partnerCount: number;
  epilogue?: Epilogue;
}

// One partner still leaves a working government; every further one waters
// it down, so a broad coalition is never worth it.
export const MAX_STRONG_COALITION_PARTNERS = 1;

function getSeatSetup(state: CampaignState, config: CoalitionConfig) {
  const parliamentary = getParliamentaryConfig(config.electionConfig);
  if (
    !isStrategicMode(config) ||
    !isProportionalElection(parliamentary) ||
    !state.results
  ) {
    return undefined;
  }
  const mandates = state.results.mandates;
  const toSeatParty = (partyId: string): SeatParty => {
    const party = config.electionConfig.parties.find((p) => p.id === partyId);
    return {
      partyId,
      name: party?.name ?? partyId,
      color: party?.color ?? "#64748b",
      seats: mandates.find((m) => m.party === partyId)?.totalSeats ?? 0,
    };
  };
  const player = toSeatParty(state.playerSide?.partyId ?? "");
  const largestRival = Math.max(
    0,
    ...mandates
      .filter((m) => m.party !== player.partyId)
      .map((m) => m.totalSeats),
  );
  return {
    player,
    toSeatParty,
    allSeats: parliamentary.allSeats,
    majority: getMajorityThresholds(parliamentary.allSeats).simple,
    // Only the party with the most seats is asked to form a government.
    isLargest: player.seats > 0 && player.seats >= largestRival,
  };
}

function getPartners(config: CoalitionConfig): CoalitionPartner[] {
  return config.politicalConfig?.coalition?.partners ?? [];
}

export function buildCoalitionView(
  state: CampaignState,
  config: CoalitionConfig,
): CoalitionView | undefined {
  const setup = getSeatSetup(state, config);
  if (!setup) {
    return undefined;
  }
  const partners = getPartners(config)
    .filter((partner) => partner.partyId !== setup.player.partyId)
    .map((partner) => setup.toSeatParty(partner.partyId))
    .filter((party) => party.seats > 0)
    .sort((a, b) => b.seats - a.seats);
  return {
    player: setup.player,
    partners,
    allSeats: setup.allSeats,
    majority: setup.majority,
  };
}

// The coalition phase only opens once, after a proportional election in which
// the player's party came first but without a majority of its own.
export function needsCoalitionOffer(
  state: CampaignState,
  config: CoalitionConfig,
): boolean {
  if (!state.isEnded || state.coalition) {
    return false;
  }
  const view = buildCoalitionView(state, config);
  return (
    view !== undefined &&
    getSeatSetup(state, config)?.isLargest === true &&
    view.partners.length > 0 &&
    view.player.seats < view.majority
  );
}

// All offers are answered at once; a partner without a condition accepts.
export function submitCoalitionOffer(
  state: CampaignState,
  config: CoalitionConfig,
  answers: Answers,
  partyIds: string[],
): CampaignState {
  const view = buildCoalitionView(state, config);
  const offered = view?.partners.filter((p) => partyIds.includes(p.partyId));
  if (!needsCoalitionOffer(state, config) || !offered?.length) {
    return state;
  }
  const holds = createConditionCheck(state, answers, config.electionConfig);
  const partners = getPartners(config);
  return {
    ...state,
    coalition: {
      responses: offered.map(({ partyId }) => {
        const partner = partners.find((p) => p.partyId === partyId);
        return {
          partyId,
          accepted: !partner?.acceptWhen || holds(partner.acceptWhen),
        };
      }),
    },
  };
}

export function buildCoalitionResult(
  state: CampaignState,
  config: CoalitionConfig,
): CoalitionResult | undefined {
  const setup = getSeatSetup(state, config);
  if (!setup || !state.coalition) {
    return undefined;
  }
  const partners = getPartners(config);
  const responses = state.coalition.responses.map(
    ({ partyId, accepted }): CoalitionResponseView => {
      const partner = partners.find((p) => p.partyId === partyId);
      return {
        ...setup.toSeatParty(partyId),
        accepted,
        reason:
          (accepted ? partner?.acceptReason : partner?.rejectReason) ?? "",
      };
    },
  );
  const accepted = responses.filter((r) => r.accepted);
  const seats =
    setup.player.seats + accepted.reduce((sum, r) => sum + r.seats, 0);
  return {
    responses,
    seats,
    majority: setup.majority,
    outcome:
      seats < setup.majority
        ? "failed"
        : accepted.length > MAX_STRONG_COALITION_PARTNERS
          ? "weak-coalition"
          : "coalition",
    partnerCount: accepted.length,
  };
}

export function getGovernmentOutcome(
  state: CampaignState,
  config: CoalitionConfig,
): GovernmentOutcome | undefined {
  const setup = getSeatSetup(state, config);
  if (!setup) {
    return undefined;
  }
  if (setup.player.seats >= setup.majority) {
    return "single-majority";
  }
  if (!setup.isLargest) {
    return "opposition";
  }
  return buildCoalitionResult(state, config)?.outcome ?? "failed";
}

export function buildFinalOutcome(
  state: CampaignState,
  config: CoalitionConfig,
  answers: Answers,
): FinalOutcome | undefined {
  const setup = getSeatSetup(state, config);
  const outcome = getGovernmentOutcome(state, config);
  if (!setup || !outcome) {
    return undefined;
  }
  const holds = createConditionCheck(state, answers, config.electionConfig);
  const epilogue = config.politicalConfig?.epilogues?.find(
    (e) =>
      (!e.outcomes || e.outcomes.includes(outcome)) &&
      (!e.when || holds(e.when)),
  );
  const coalition = buildCoalitionResult(state, config);
  const inCoalition =
    (outcome === "coalition" || outcome === "weak-coalition") &&
    coalition !== undefined;
  return {
    outcome,
    playerSeats: setup.player.seats,
    governmentSeats: inCoalition ? coalition.seats : setup.player.seats,
    majority: setup.majority,
    partnerCount: inCoalition ? coalition.partnerCount : 0,
    epilogue,
  };
}

export type EndResultStory =
  | "playerSideVictory"
  | "playerSideDefeat"
  | "deadlock";

// In strategic mode the story follows the government formed, so a coalition
// after a hung parliament reads as a victory rather than a deadlock.
export function getEndResultStory(
  outcome: GovernmentOutcome | undefined,
  playerWon: boolean,
  noWinner: boolean,
): EndResultStory {
  switch (outcome) {
    case "single-majority":
    case "coalition":
    case "weak-coalition":
      return "playerSideVictory";
    case "failed":
      return "deadlock";
    case "opposition":
      return noWinner ? "deadlock" : "playerSideDefeat";
    default:
      if (noWinner) {
        return "deadlock";
      }
      return playerWon ? "playerSideVictory" : "playerSideDefeat";
  }
}
