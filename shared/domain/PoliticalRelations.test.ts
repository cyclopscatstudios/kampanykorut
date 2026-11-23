import { CampaignConfig, CampaignState } from "@shared/types";
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
        score: -2,
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

  describe("shift-relation", () => {
    const definitions = [
      {
        id: "kadar_wing",
        tone: "calm" as const,
        label: "Kivár",
        labels: {
          good: "Támogat",
          calm: "Kivár",
          tense: "Elégedetlen",
          bad: "Ellenséges",
        },
      },
    ];
    const shift = (steps: number, description = "Változott.") => ({
      type: "shift-relation" as const,
      relationId: "kadar_wing",
      steps,
      description,
    });
    const standing = (s: CampaignState) =>
      s.politicalDashboard?.relations?.kadar_wing;

    it("adds steps to the starting tone and labels the resulting tone", () => {
      const once = setRelations(state, [shift(-2, "Bírálnak.")], definitions);
      expect(standing(once)).toEqual({
        tone: "tense",
        label: "Elégedetlen",
        description: "Bírálnak.",
        changedAtTurn: 6,
        score: -1,
      });

      const twice = setRelations(once, [shift(-3)], definitions);
      expect(standing(twice)).toMatchObject({ tone: "bad", score: -4 });
    });

    it("needs several good steps to climb back from a bad standing", () => {
      const bad = setRelations(
        state,
        [{ ...ultimatum, tone: "bad", label: "Ellenséges" }],
        definitions,
      );
      const better = setRelations(bad, [shift(3)], definitions);
      expect(standing(better)).toMatchObject({ tone: "tense", score: -2 });

      const good = setRelations(better, [shift(3), shift(3)], definitions);
      expect(standing(good)).toMatchObject({ tone: "good", score: 4 });
    });

    it("keeps the score within the range", () => {
      const high = setRelations(state, [shift(20)], definitions);
      expect(standing(high)?.score).toBe(6);
      const low = setRelations(high, [shift(-30)], definitions);
      expect(standing(low)?.score).toBe(-6);
    });

    it("keeps the current label when the tone has no label and does not change", () => {
      const changed = setRelations(
        state,
        [shift(1)],
        [{ id: "kadar_wing", tone: "calm", label: "Kivár" }],
      );
      expect(standing(changed)).toMatchObject({ tone: "calm", label: "Kivár" });
    });
  });

  it("leaves the state untouched without relation effects", () => {
    expect(setRelations(state, [])).toBe(state);
  });
});
