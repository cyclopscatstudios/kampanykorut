import { CampaignConfig, CampaignState, Mandate } from "../types";
import {
  buildCoalitionResult,
  buildCoalitionView,
  buildFinalOutcome,
  getEndResultStory,
  getGovernmentOutcome,
  needsCoalitionOffer,
  submitCoalitionOffer,
} from "./Coalition";

const config = {
  electionConfig: {
    parties: [
      { id: "green", name: "Zöldek", color: "#0f0" },
      { id: "yellow", name: "Sárgák", color: "#ff0" },
      { id: "red", name: "Vörösek", color: "#f00" },
      { id: "blue", name: "Kékek", color: "#00f" },
    ],
    election: { type: "proportional", regions: [] },
    allSeats: 400,
    listSeats: 50,
  },
  politicalConfig: {
    gameMode: "strategic",
    focuses: [
      {
        id: "unity",
        title: "Egység",
        summary: "",
        description: "",
        completeWhen: {
          type: "answer-selected",
          questionId: "q",
          answerId: "A",
        },
      },
    ],
    coalition: {
      partners: [
        {
          partyId: "yellow",
          acceptWhen: {
            type: "answer-selected",
            questionId: "q",
            answerId: "A",
          },
          acceptReason: "Elfogadják",
          rejectReason: "Elutasítják",
        },
        { partyId: "red", acceptReason: "Igen", rejectReason: "Nem" },
        { partyId: "blue", acceptReason: "Igen", rejectReason: "Nem" },
      ],
    },
    epilogues: [
      {
        id: "united",
        title: "Egységes kormány",
        body: "",
        outcomes: ["coalition"],
        when: { type: "answer-selected", questionId: "q", answerId: "A" },
      },
      {
        id: "any_coalition",
        title: "Koalíció",
        body: "",
        outcomes: ["coalition"],
      },
      { id: "fallback", title: "Vége", body: "" },
    ],
  },
} as unknown as Pick<CampaignConfig, "politicalConfig" | "electionConfig">;

const mandate = (party: string, totalSeats: number) =>
  ({
    party,
    totalSeats,
    constituencySeats: totalSeats,
    listSeats: 0,
  }) as Mandate;

const stateWith = (
  seats: Record<string, number>,
  overrides: Partial<CampaignState> = {},
): CampaignState =>
  ({
    activeCampaignId: "c",
    turn: 4,
    isEnded: true,
    isBaseResultsAlreadyApplied: true,
    playerSide: { partyId: "green", candidateId: "x" },
    politicalDashboard: { seenEventIds: [], selectedFocusId: "unity" },
    results: {
      mandates: Object.entries(seats).map(([p, s]) => mandate(p, s)),
      percentages: { candidateListResults: {}, partyListResults: {} },
    },
    ...overrides,
  }) as CampaignState;

const hung = stateWith({ green: 180, yellow: 30, red: 150, blue: 0, _x: 40 });
const answeredA = [{ questionId: "q", answerId: "A" }];

describe("Coalition", () => {
  it("lists the partners that won seats, largest first", () => {
    const view = buildCoalitionView(hung, config);

    expect(view?.player).toMatchObject({ partyId: "green", seats: 180 });
    expect(view?.partners.map((p) => [p.partyId, p.seats])).toEqual([
      ["red", 150],
      ["yellow", 30],
    ]);
    expect(view?.majority).toBe(201);
  });

  it("opens the coalition phase only without a majority of its own", () => {
    expect(needsCoalitionOffer(hung, config)).toBe(true);
    expect(needsCoalitionOffer(stateWith({ green: 201 }), config)).toBe(false);
    expect(needsCoalitionOffer(stateWith({ green: 0, red: 400 }), config)).toBe(
      false,
    );
    expect(needsCoalitionOffer({ ...hung, isEnded: false }, config)).toBe(
      false,
    );
    const second = stateWith({ green: 150, red: 180, yellow: 70 });
    expect(needsCoalitionOffer(second, config)).toBe(false);
    expect(getGovernmentOutcome(second, config)).toBe("opposition");
    const classic = {
      ...config,
      politicalConfig: { ...config.politicalConfig!, gameMode: "classic" },
    } as typeof config;
    expect(needsCoalitionOffer(hung, classic)).toBe(false);
  });

  it("answers every offer at once from the campaign conditions", () => {
    const offered = submitCoalitionOffer(hung, config, [], ["yellow"]);

    expect(offered.coalition).toEqual({
      responses: [{ partyId: "yellow", accepted: false }],
    });
    expect(buildCoalitionResult(offered, config)).toMatchObject({
      seats: 180,
      outcome: "failed",
      responses: [
        { partyId: "yellow", accepted: false, reason: "Elutasítják" },
      ],
    });

    const accepted = submitCoalitionOffer(hung, config, answeredA, [
      "yellow",
      "red",
    ]);
    expect(buildCoalitionResult(accepted, config)).toMatchObject({
      seats: 360,
      outcome: "weak-coalition",
      partnerCount: 2,
    });
  });

  it("allows only one offer, and only to partners with seats", () => {
    const offered = submitCoalitionOffer(hung, config, [], ["red"]);

    expect(submitCoalitionOffer(offered, config, [], ["yellow"])).toBe(offered);
    expect(submitCoalitionOffer(hung, config, [], ["blue", "nobody"])).toBe(
      hung,
    );
    expect(submitCoalitionOffer(hung, config, [], [])).toBe(hung);
  });

  it("names the government outcome", () => {
    expect(getGovernmentOutcome(stateWith({ green: 220 }), config)).toBe(
      "single-majority",
    );
    expect(
      getGovernmentOutcome(stateWith({ green: 0, red: 400 }), config),
    ).toBe("opposition");
    expect(getGovernmentOutcome(hung, config)).toBe("failed");
    expect(
      getGovernmentOutcome(
        submitCoalitionOffer(hung, config, [], ["red"]),
        config,
      ),
    ).toBe("coalition");
  });

  it("picks the first matching epilogue", () => {
    const coalition = submitCoalitionOffer(hung, config, answeredA, ["red"]);

    expect(buildFinalOutcome(coalition, config, answeredA)).toMatchObject({
      outcome: "coalition",
      playerSeats: 180,
      governmentSeats: 330,
      partnerCount: 1,
      epilogue: { id: "united" },
    });
    const broad = submitCoalitionOffer(hung, config, answeredA, [
      "red",
      "yellow",
    ]);
    expect(buildFinalOutcome(broad, config, answeredA)).toMatchObject({
      outcome: "weak-coalition",
      governmentSeats: 360,
      partnerCount: 2,
      epilogue: { id: "fallback" },
    });
    const withoutA = submitCoalitionOffer(hung, config, [], ["red"]);
    expect(buildFinalOutcome(withoutA, config, [])).toMatchObject({
      epilogue: { id: "any_coalition" },
    });
    expect(buildFinalOutcome(hung, config, answeredA)?.epilogue?.id).toBe(
      "fallback",
    );
  });
});

describe("getEndResultStory", () => {
  it("keeps the classic story without a government outcome", () => {
    expect(getEndResultStory(undefined, true, false)).toBe("playerSideVictory");
    expect(getEndResultStory(undefined, false, false)).toBe("playerSideDefeat");
    expect(getEndResultStory(undefined, false, true)).toBe("deadlock");
  });

  it("follows the government formed in strategic mode", () => {
    expect(getEndResultStory("coalition", false, true)).toBe(
      "playerSideVictory",
    );
    expect(getEndResultStory("single-majority", true, false)).toBe(
      "playerSideVictory",
    );
    expect(getEndResultStory("weak-coalition", false, true)).toBe(
      "playerSideVictory",
    );
    expect(getEndResultStory("failed", false, true)).toBe("deadlock");
    expect(getEndResultStory("opposition", false, false)).toBe(
      "playerSideDefeat",
    );
    expect(getEndResultStory("opposition", false, true)).toBe("deadlock");
  });
});
