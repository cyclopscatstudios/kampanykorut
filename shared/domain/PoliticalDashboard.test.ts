import { CampaignConfig, CampaignEvent, CampaignState } from "../types";
import {
  buildDashboardOverview,
  getGameMode,
  getPublicEvents,
  getTotalTurns,
  getUnseenPublicEventIds,
  isStrategicMode,
  markPublicEventsSeen,
} from "./PoliticalDashboard";

const event = (id: string, announced = true): CampaignEvent => ({
  id,
  conditions: [],
  ...(announced && {
    announcement: { title: `${id} cím`, body: `${id} szöveg` },
  }),
});

const events = [event("ultimatum"), event("hidden", false), event("congress")];

const stateWith = (overrides: Partial<CampaignState> = {}): CampaignState =>
  ({
    activeCampaignId: "c",
    turn: 7,
    isEnded: false,
    isBaseResultsAlreadyApplied: true,
    ...overrides,
  }) as CampaignState;

describe("PoliticalDashboard", () => {
  it("treats a campaign without political config as classic", () => {
    expect(getGameMode({})).toBe("classic");
    expect(getGameMode(undefined)).toBe("classic");
    expect(isStrategicMode({})).toBe(false);
    expect(
      isStrategicMode({ politicalConfig: { gameMode: "strategic" } }),
    ).toBe(true);
  });

  it("lists only acknowledged events that have an announcement, in trigger order", () => {
    const state = stateWith({
      campaignEvents: {
        triggeredEventIds: ["congress", "hidden", "ultimatum"],
        pendingAnnouncementIds: ["ultimatum"],
      },
    });

    expect(getPublicEvents(state, events)).toEqual([
      { id: "congress", title: "congress cím", body: "congress szöveg" },
    ]);
  });

  it("reports unseen events until they are marked as seen", () => {
    const state = stateWith({
      campaignEvents: {
        triggeredEventIds: ["ultimatum", "congress"],
        pendingAnnouncementIds: [],
      },
      politicalDashboard: { seenEventIds: ["ultimatum"] },
    });

    expect(getUnseenPublicEventIds(state, events)).toEqual(["congress"]);

    const seen = markPublicEventsSeen(state, events);
    expect(seen.politicalDashboard?.seenEventIds).toEqual([
      "ultimatum",
      "congress",
    ]);
    expect(getUnseenPublicEventIds(seen, events)).toEqual([]);
    expect(markPublicEventsSeen(seen, events)).toBe(seen);
  });

  it("falls back to the question count when the decision count is unknown", () => {
    const config = {
      playableSides: {
        mszmp: { nagy: { questions: [{}, {}, {}], answerEffect: [] } },
      },
    } as unknown as Pick<CampaignConfig, "playableSides">;
    const playerSide = { partyId: "mszmp", candidateId: "nagy" };

    expect(getTotalTurns({ playerSide }, config)).toBe(3);
    expect(getTotalTurns({ playerSide, decisionCount: 12 }, config)).toBe(12);
    expect(getTotalTurns({}, config)).toBe(0);
  });

  it("builds an empty overview before any public event", () => {
    expect(
      buildDashboardOverview(stateWith({ decisionCount: 12 }), {
        campaignEvents: events,
      }),
    ).toEqual({
      turn: 7,
      totalTurns: 12,
      latestEvent: undefined,
      publicEventCount: 0,
      hasUnseenEvents: false,
    });
  });

  it("puts the latest public event on the overview", () => {
    const state = stateWith({
      decisionCount: 12,
      campaignEvents: {
        triggeredEventIds: ["ultimatum", "congress"],
        pendingAnnouncementIds: [],
      },
    });

    const overview = buildDashboardOverview(state, { campaignEvents: events });
    expect(overview.latestEvent?.id).toBe("congress");
    expect(overview.publicEventCount).toBe(2);
    expect(overview.hasUnseenEvents).toBe(true);
  });
});
