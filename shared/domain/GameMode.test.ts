import { EffectType } from "@shared/types";
import {
  answerForGameMode,
  getAvailableGameModes,
  getDefaultGameMode,
  isInGameMode,
  resolveGameMode,
} from "./GameMode";

describe("GameMode", () => {
  it("reads the legacy single mode and the mode list", () => {
    expect(getAvailableGameModes(undefined)).toEqual(["classic"]);
    expect(getAvailableGameModes({ gameMode: "strategic" })).toEqual([
      "strategic",
    ]);
    expect(
      getAvailableGameModes({ gameModes: ["strategic", "classic"] }),
    ).toEqual(["classic", "strategic"]);
  });

  it("defaults to classic when both modes are available", () => {
    expect(getDefaultGameMode({ gameModes: ["strategic", "classic"] })).toBe(
      "classic",
    );
    expect(getDefaultGameMode({ gameModes: ["strategic"] })).toBe("strategic");
  });

  it("falls back to the default for a mode the side does not offer", () => {
    expect(resolveGameMode("strategic", undefined)).toBe("classic");
    expect(resolveGameMode("classic", { gameMode: "strategic" })).toBe(
      "strategic",
    );
    expect(
      resolveGameMode("strategic", { gameModes: ["classic", "strategic"] }),
    ).toBe("strategic");
  });

  it("treats an item without gameModes as part of both modes", () => {
    expect(isInGameMode({}, "classic")).toBe(true);
    expect(isInGameMode({ gameModes: ["strategic"] }, "classic")).toBe(false);
  });

  it("drops strategic effects and conditional effects in classic", () => {
    const answer = answerForGameMode(
      {
        id: "A",
        effects: [
          { type: EffectType.UniformSwing, params: { a: 1 } },
          {
            type: EffectType.IssueStance,
            params: { issueId: "x", shift: 1 },
          },
        ],
        conditionalEffects: [
          {
            if: [{ questionId: "q", answerId: "A" }],
            mode: "merge",
            effects: [],
            gameModes: ["strategic"],
          },
        ],
      },
      "classic",
    );
    expect(answer.effects.map((e) => e.type)).toEqual([
      EffectType.UniformSwing,
    ]);
    expect(answer.conditionalEffects).toEqual([]);
  });
});
