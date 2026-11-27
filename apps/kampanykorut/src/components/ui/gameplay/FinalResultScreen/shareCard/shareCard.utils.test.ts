import type {
  CampaignConfig,
  CampaignState,
  FinalResults,
  MayoralResult,
} from "@shared/types";
import type { TFunction } from "i18next";
import {
  buildShareCard,
  buildShareUrl,
  formatPercent,
  hungarianArticle,
} from "./shareCard.utils";

const t = ((key: string, options?: Record<string, unknown>) =>
  options ? `${key} ${JSON.stringify(options)}` : key) as unknown as TFunction;

const parties = [
  {
    id: "tisza",
    name: "Tisztelet és Szabadság Párt",
    shortName: "TISZA",
    color: "#67d6f7",
  },
  { id: "fidesz", name: "Fidesz–KDNP", color: "#f28c28" },
  { id: "mi_hazank", name: "Mi Hazánk", color: "#6b9b23" },
];

const config = {
  electionConfig: {
    title: "Tavaszi szél",
    year: "2026",
    parties,
    allSeats: 199,
    listSeats: 93,
    playableSides: [
      {
        id: "tisza",
        label: "TISZA",
        mainCandidates: [{ id: "magyar_peter", label: "Magyar Péter" }],
      },
    ],
  },
  playableSides: {
    tisza: {
      magyar_peter: {
        endResults: {
          playerSideVictory: {
            title: "Győzelem az urnáknál",
            subtitle: "",
            description: "",
            imageUri: "/images/win.png",
          },
          playerSideDefeat: {
            title: "Vereség az urnáknál",
            subtitle: "",
            description: "",
            imageUri: "/images/loss.png",
          },
          deadlock: {
            title: "Kormányválság",
            subtitle: "",
            description: "",
            imageUri: "/images/deadlock.png",
          },
        },
      },
    },
  },
} as unknown as CampaignConfig;

const state = {
  activeCampaignId: "2026_tavaszi-szel",
  playerSide: { partyId: "tisza", candidateId: "magyar_peter" },
  turn: 32,
} as unknown as CampaignState;

function parliamentary(seats: Record<string, number>): FinalResults {
  return {
    mandates: Object.entries(seats).map(([party, totalSeats]) => ({
      party,
      totalSeats,
      constituencySeats: 0,
      listSeats: totalSeats,
    })),
  } as unknown as FinalResults;
}

const build = (results: FinalResults, cfg = config, st = state) =>
  buildShareCard({
    results,
    config: cfg,
    state: st,
    history: [],
    campaignId: "2026_tavaszi-szel",
    origin: "https://kampanykorut.hu",
    locale: "hu",
    t,
  });

describe("buildShareCard", () => {
  it("describes a parliamentary victory with the player's seats", () => {
    const card = build(parliamentary({ tisza: 138, fidesz: 52, mi_hazank: 9 }));
    expect(card.outcome).toBe("win");
    expect(card.title).toBe("Győzelem az urnáknál");
    expect(card.imageUri).toBe("/images/win.png");
    expect(card.metricValue).toBe("138");
    expect(card.metricSuffix).toBe("/ 199");
    expect(card.accent).toBe("#67d6f7");
    expect(card.candidateName).toBe("Magyar Péter");
    expect(card.campaignLabel).toBe("2026 · Tavaszi szél");
    expect(card.turns).toBe(32);
    expect(card.seats?.map((s) => s.seats)).toEqual([138, 52, 9]);
    expect(card.shareText).toContain("endResult.share.text.win");
    expect(card.shareText).toContain('"article":"a"');
  });

  it("uses the winner's colour on a defeat", () => {
    const card = build(parliamentary({ tisza: 71, fidesz: 120, mi_hazank: 8 }));
    expect(card.outcome).toBe("loss");
    expect(card.accent).toBe("#f28c28");
    expect(card.imageUri).toBe("/images/loss.png");
  });

  it("reports a deadlock when nobody has a majority", () => {
    const card = build(parliamentary({ tisza: 95, fidesz: 90, mi_hazank: 14 }));
    expect(card.outcome).toBe("deadlock");
    expect(card.title).toBe("Kormányválság");
    expect(card.winnerLabel).toBe("endResult.share.card.leader");
  });

  it("shows the vote share in mayoral mode", () => {
    const mayoralConfig = {
      ...config,
      electionConfig: {
        ...config.electionConfig,
        title: "Budapest – főpolgármester-választás",
        election: { type: "mayoral" },
        parties: [
          { id: "vitezy", name: "Vitézy Dávid", color: "#0f0" },
          { id: "karacsony", name: "Karácsony Gergely", color: "#f60" },
        ],
        playableSides: [
          {
            id: "vitezy",
            label: "Vitézy Dávid",
            mainCandidates: [{ id: "vitezy", label: "Vitézy Dávid" }],
          },
        ],
      },
      playableSides: {},
    } as unknown as CampaignConfig;
    const mayoralResult = {
      outcome: { kind: "winner", candidateId: "karacsony" },
      standings: [
        { candidateId: "karacsony", votes: 100, share: 0.4782 },
        { candidateId: "vitezy", votes: 99, share: 0.4776 },
      ],
    } as unknown as MayoralResult;
    const card = build(
      { mandates: [], mayoralResult } as unknown as FinalResults,
      mayoralConfig,
      {
        ...state,
        playerSide: { partyId: "vitezy", candidateId: "vitezy" },
      } as CampaignState,
    );
    expect(card.outcome).toBe("loss");
    expect(card.metricValue).toBe("47,8%");
    expect(card.seats).toBeUndefined();
    expect(card.bars).toHaveLength(2);
    expect(card.title).toBe("endResult.share.card.title.loss");
  });
});

describe("hungarianArticle", () => {
  it.each([
    ["Tavaszi szél", "a"],
    ["A forradalom öröksége", "az"],
    ["Öt év", "az"],
    ["1957", "az"],
    ["2026", "a"],
    ["5 perc", "az"],
    ["10 nap", "a"],
  ])("%s → %s", (word, article) => {
    expect(hungarianArticle(word)).toBe(article);
  });
});

describe("formatPercent", () => {
  it("follows the selected language", () => {
    expect(formatPercent(0.4782, "hu")).toBe("47,8%");
    expect(formatPercent(0.4782, "en")).toBe("47.8%");
  });
});

describe("buildShareUrl", () => {
  it("links to the campaign page with share utm parameters", () => {
    expect(buildShareUrl("https://kampanykorut.hu", "1957_x")).toBe(
      "https://kampanykorut.hu/kampany/1957_x?utm_source=result_card&utm_medium=share&utm_campaign=1957_x",
    );
  });
});
