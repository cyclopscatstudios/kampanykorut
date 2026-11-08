import { CampaignConfig, CampaignState } from "../types";
import { hasDashboardNews } from "./PoliticalDashboard";
import {
  buildRelationGroups,
  getUnseenRelationIds,
  markRelationsSeen,
  setRelations,
} from "./PoliticalRelations";

const config = {
  politicalConfig: {
    gameMode: "strategic",
    relationGroups: [
      { id: "party", title: "Párton belül" },
      { id: "empty", title: "Üres csoport" },
      { id: "society", title: "Társadalom" },
    ],
    relations: [
      {
        id: "kadar_wing",
        name: "Kádár-szárny",
        groupId: "party",
        tone: "calm",
        label: "Kivár",
        description: "Még nem döntöttek.",
      },
      {
        id: "students",
        name: "Egyetemisták",
        groupId: "society",
        icon: "mortarboard-fill",
        tone: "good",
        label: "Lelkes",
        description: "A legaktívabb támogatóid.",
      },
    ],
  },
} as unknown as Pick<CampaignConfig, "politicalConfig">;

const state = {
  activeCampaignId: "c",
  turn: 6,
  isEnded: false,
  isBaseResultsAlreadyApplied: true,
} as CampaignState;

const ultimatum = {
  type: "set-relation" as const,
  relationId: "kadar_wing",
  tone: "tense" as const,
  label: "Feszült",
  description: "Nyíltan szembehelyezkednek.",
};

describe("PoliticalRelations", () => {
  it("shows the configured standings grouped, skipping empty groups", () => {
    expect(buildRelationGroups(state, config)).toEqual([
      {
        id: "party",
        title: "Párton belül",
        relations: [
          {
            id: "kadar_wing",
            name: "Kádár-szárny",
            icon: undefined,
            tone: "calm",
            label: "Kivár",
            description: "Még nem döntöttek.",
            isNew: false,
          },
        ],
      },
      {
        id: "society",
        title: "Társadalom",
        relations: [expect.objectContaining({ id: "students", isNew: false })],
      },
    ]);
  });

  it("applies a relation change and marks it new until seen", () => {
    const changed = setRelations(state, [ultimatum]);

    expect(changed.politicalDashboard?.relations).toEqual({
      kadar_wing: {
        tone: "tense",
        label: "Feszült",
        description: "Nyíltan szembehelyezkednek.",
        changedAtTurn: 6,
      },
    });
    expect(getUnseenRelationIds(changed)).toEqual(["kadar_wing"]);
    expect(hasDashboardNews(changed, config as never, [])).toBe(true);
    expect(buildRelationGroups(changed, config)[0].relations[0]).toMatchObject({
      tone: "tense",
      label: "Feszült",
      isNew: true,
    });

    const seen = markRelationsSeen(changed);
    expect(getUnseenRelationIds(seen)).toEqual([]);
    expect(hasDashboardNews(seen, config as never, [])).toBe(false);
    expect(markRelationsSeen(seen)).toBe(seen);
  });

  it("marks a seen relation new again when it changes later", () => {
    const seen = markRelationsSeen(setRelations(state, [ultimatum]));
    const again = setRelations({ ...seen, turn: 8 }, [
      { ...ultimatum, tone: "bad", label: "Ellenséges" },
    ]);

    expect(getUnseenRelationIds(again)).toEqual(["kadar_wing"]);
    expect(again.politicalDashboard?.relations?.kadar_wing.changedAtTurn).toBe(
      8,
    );
  });

  it("leaves the state untouched without relation effects", () => {
    expect(setRelations(state, [])).toBe(state);
  });
});
