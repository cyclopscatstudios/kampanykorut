import { describe, expect, it } from "vitest";
import {
  CampaignSource,
  Diagnostic,
  validateCampaign,
} from "./campaignValidator";

type Files = Record<string, unknown>;

const header = { id: "test_campaign", route: "test" };

function validBundle(): Files {
  return {
    "manifest.json": {
      schemaVersion: 1,
      files: {
        electionConfig: "election_config.json",
        voterEnvironmentConfig: "voter.json",
        candidateListData: "candidates.json",
        customGroups: "groups.json",
        playableSides: {
          party_a: {
            candidate_a: {
              questions: "side/questions.json",
              answerEffect: "side/effects.json",
              campaignStrategies: "side/strategies.json",
              advisorFeedback: "side/feedback.json",
              endResults: "side/end.json",
            },
          },
        },
      },
    },
    "election_config.json": {
      listSeats: 93,
      allSeats: 199,
      thresholdPercent: 5,
      districtMap: "2011",
      parties: [
        { id: "party_a", name: "A", color: "#000" },
        { id: "party_b", name: "B", color: "#fff" },
      ],
      partyListVotes: { party_a: 10, party_b: 5, _other: 1 },
      playableSides: [
        {
          id: "party_a",
          label: "A",
          mainCandidates: [{ id: "candidate_a", label: "A" }],
          playableCandidates: ["candidate_a"],
        },
      ],
      electionAssets: [{ id: "party_a", party_logo: "/images/logo.png" }],
    },
    "voter.json": {},
    "candidates.json": [
      { megyekod: 1, oevk: 1, partok: { party_a: 10, party_b: 5 } },
      { megyekod: 1, oevk: 2, partok: { party_a: 3, party_b: 8 } },
    ],
    "groups.json": [
      { id: "my_group", label: "Mine", districts: [{ megyekod: 1, oevk: 2 }] },
    ],
    "side/questions.json": [
      {
        id: "q1",
        question: "?",
        possibleAnswers: [
          { id: "A", label: "a" },
          { id: "B", label: "b" },
        ],
      },
      {
        id: "q2",
        question: "?",
        possibleAnswers: [{ id: "A", label: "a" }],
      },
    ],
    "side/effects.json": [
      {
        id: "q1",
        answers: [
          {
            id: "A",
            effects: [{ type: "uniform-swing", params: { party_a: 1 } }],
          },
          {
            id: "B",
            effects: [
              {
                type: "district-vote-transfer",
                params: [
                  {
                    groupId: "my_group",
                    targetParty: "party_a",
                    amount: 100,
                    from: { type: "party", party: "party_b" },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "q2",
        answers: [
          {
            id: "A",
            effects: [
              {
                type: "district-vote-transfer",
                params: [
                  { megyekod: 1, oevk: 1, targetParty: "party_b", amount: 50 },
                ],
              },
            ],
            conditionalEffects: [
              {
                if: [{ questionId: "q1", answerId: "A" }],
                mode: "merge",
                effects: [{ type: "turnout-change", params: { party_a: 2 } }],
              },
            ],
          },
        ],
      },
    ],
    "side/strategies.json": [
      {
        id: "s1",
        label: "S1",
        conditions: [
          { questionId: "q1", answerId: "A" },
          { questionId: "q2", answerId: "A" },
        ],
        rewards: [
          {
            minMatches: 2,
            effects: [{ type: "uniform-swing", params: { party_a: 1 } }],
          },
        ],
      },
    ],
    "side/feedback.json": [
      {
        questionId: "q2",
        answers: [{ answerId: "A", text: "ok" }],
        conditionalAnswers: [
          {
            if: [{ questionId: "q1", answerId: "B" }],
            answer: { answerId: "A", text: "after B" },
          },
        ],
      },
    ],
    "side/end.json": {
      playerSideVictory: { title: "win", imageUri: "/images/win.png" },
    },
  };
}

const publicFiles = new Set(["/images/logo.png", "/images/win.png"]);

function sourceFor(files: Files): CampaignSource {
  return {
    readCampaignFile(_route, relativePath) {
      if (!(relativePath in files)) {
        return { ok: false, reason: "missing" };
      }
      const data = files[relativePath];
      if (data === INVALID_JSON) {
        return {
          ok: false,
          reason: "invalid-json",
          message: "Unexpected token",
        };
      }
      return { ok: true, data: structuredClone(data) };
    },
    publicFileExists: (path) => publicFiles.has(path),
  };
}

const INVALID_JSON = Symbol("invalid-json");

function validate(mutate?: (files: Files) => void) {
  const files = validBundle();
  mutate?.(files);
  return validateCampaign(header, sourceFor(files));
}

const codes = (diagnostics: Diagnostic[]) =>
  diagnostics.map((d) => `${d.severity}:${d.code}`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const file = (files: Files, name: string) => files[name] as any;
const effects = (files: Files) => file(files, "side/effects.json");

describe("validateCampaign", () => {
  it("accepts a valid bundle", () => {
    expect(validate()).toEqual([]);
  });

  it("reports a missing referenced file", () => {
    const result = validate((f) => delete f["side/feedback.json"]);
    expect(result).toEqual([
      expect.objectContaining({
        code: "file-missing",
        file: "side/feedback.json",
      }),
    ]);
  });

  it("reports invalid JSON", () => {
    expect(codes(validate((f) => (f["side/end.json"] = INVALID_JSON)))).toEqual(
      ["error:file-invalid-json"],
    );
  });

  it("rejects paths that escape the campaign folder", () => {
    const result = validate((f) => {
      file(f, "manifest.json").files.customGroups = "../other/groups.json";
    });
    expect(codes(result)).toContain("error:manifest-path-outside-bundle");
  });

  it("rejects an unsupported schema version", () => {
    const result = validate((f) => {
      file(f, "manifest.json").schemaVersion = 2;
    });
    expect(codes(result)).toEqual(["error:schema-version-unsupported"]);
  });

  it("reports an effect nested inside another effect's params", () => {
    const result = validate((f) => {
      effects(f)[0].answers[1].effects[0].params.push({
        type: "district-vote-transfer",
        params: [],
      });
    });
    expect(result).toEqual([
      expect.objectContaining({
        code: "effect-nested",
        path: "/0/answers/1/effects/0/params/1",
      }),
    ]);
  });

  it("reports an effect without a type", () => {
    const result = validate((f) => {
      effects(f)[0].answers[0].effects.push({
        groupId: "my_group",
        targetParty: "party_a",
        amount: 1,
      });
    });
    expect(codes(result)).toEqual(["error:effect-type-unknown"]);
  });

  it("reports unknown district groups, including custom ones", () => {
    const result = validate((f) => {
      effects(f)[0].answers[1].effects[0].params[0].groupId =
        "nagyvarosok_oevk";
    });
    expect(codes(result)).toEqual(["error:unknown-group"]);
  });

  it("accepts default district groups", () => {
    const result = validate((f) => {
      effects(f)[0].answers[1].effects[0].params[0].groupId = "nagyvarosok";
    });
    expect(result).toEqual([]);
  });

  it("reports mixed district target forms", () => {
    const result = validate((f) => {
      effects(f)[0].answers[1].effects[0].params.push({
        megyekod: 1,
        oevk: 1,
        targetParty: "party_a",
        amount: 1,
      });
    });
    expect(codes(result)).toEqual(["error:district-target-mixed"]);
  });

  it("reports unknown districts", () => {
    const result = validate((f) => {
      effects(f)[1].answers[0].effects[0].params[0].oevk = 99;
    });
    expect(codes(result)).toEqual(["error:unknown-district"]);
  });

  it("reports unknown parties in params and vote sources", () => {
    const result = validate((f) => {
      effects(f)[0].answers[0].effects[0].params = { party_x: 1 };
      effects(f)[0].answers[1].effects[0].params[0].from.party = "party_y";
    });
    expect(codes(result)).toEqual([
      "error:unknown-party",
      "error:unknown-party",
    ]);
  });

  it("reports non-numeric effect values", () => {
    const result = validate((f) => {
      effects(f)[0].answers[0].effects[0].params = { party_a: "1" };
    });
    expect(codes(result)).toEqual(["error:effect-value-invalid"]);
  });

  it("reports answers without effects", () => {
    const result = validate((f) => {
      effects(f)[0].answers.pop();
    });
    expect(codes(result)).toEqual(["error:missing-answer-effects"]);
  });

  it("reports effects for answers that do not exist", () => {
    const result = validate((f) => {
      effects(f)[0].answers[1].id = "C";
    });
    expect(codes(result)).toEqual([
      "error:unknown-answer",
      "error:missing-answer-effects",
    ]);
  });

  it("reports duplicate question ids", () => {
    const result = validate((f) => {
      file(f, "side/questions.json")[1].id = "q1";
    });
    expect(codes(result)).toContain("error:duplicate-id");
  });

  it("reports conditions on unknown answers", () => {
    const result = validate((f) => {
      effects(f)[1].answers[0].conditionalEffects[0].if[0].answerId = "Z";
    });
    expect(codes(result)).toEqual(["error:unknown-answer"]);
  });

  it("warns about conditions on questions answered later", () => {
    const result = validate((f) => {
      file(f, "side/feedback.json")[0].conditionalAnswers[0].if[0] = {
        questionId: "q2",
        answerId: "A",
      };
    });
    expect(codes(result)).toEqual(["warning:condition-not-yet-answered"]);
  });

  it("reports advisor feedback for answers of another question", () => {
    const result = validate((f) => {
      file(f, "side/feedback.json")[0].conditionalAnswers[0].answer.answerId =
        "B";
    });
    expect(codes(result)).toEqual(["error:unknown-answer"]);
  });

  it("warns about strategies that can never be fulfilled", () => {
    const result = validate((f) => {
      file(f, "side/strategies.json")[0].conditions = [];
    });
    expect(codes(result)).toEqual(["warning:strategy-unreachable"]);
  });

  it("reports missing image assets", () => {
    const result = validate((f) => {
      file(f, "side/end.json").playerSideVictory.imageUri = "/images/nope.png";
    });
    expect(result).toEqual([
      expect.objectContaining({
        code: "asset-missing",
        path: "/playerSideVictory/imageUri",
      }),
    ]);
  });

  it("reports sides and candidates missing from the election config", () => {
    const result = validate((f) => {
      const sides = file(f, "manifest.json").files.playableSides;
      sides.party_a.candidate_x = sides.party_a.candidate_a;
      sides.party_b = {};
    });
    expect(codes(result)).toEqual([
      "error:unknown-candidate",
      "error:unknown-side",
    ]);
  });

  it("reports non-numeric list votes", () => {
    const result = validate((f) => {
      file(f, "election_config.json").partyListVotes.party_b = null;
    });
    expect(codes(result)).toEqual(["error:election-config-invalid"]);
  });

  describe("election definition", () => {
    const electionConfig = (f: Files) => file(f, "election_config.json");

    it("accepts an explicit parliamentary election", () => {
      const result = validate((f) => {
        electionConfig(f).election = { type: "parliamentary" };
      });
      expect(result).toEqual([]);
    });

    it("accepts a mayoral election without parliamentary seat fields", () => {
      const result = validate((f) => {
        const config = electionConfig(f);
        config.election = { type: "mayoral", resultRule: "plurality" };
        delete config.listSeats;
        delete config.allSeats;
        delete config.thresholdPercent;
        delete config.partyListVotes;
      });
      expect(result).toEqual([]);
    });

    it("still requires seat fields when the type is omitted", () => {
      const result = validate((f) => {
        delete electionConfig(f).listSeats;
      });
      expect(result).toEqual([
        expect.objectContaining({
          code: "election-config-invalid",
          path: "/listSeats",
        }),
      ]);
    });

    it("rejects an unknown election type", () => {
      const result = validate((f) => {
        electionConfig(f).election = { type: "presidential" };
      });
      expect(result).toEqual([
        expect.objectContaining({
          code: "election-config-invalid",
          path: "/election/type",
        }),
      ]);
    });

    it("rejects an election that is not an object", () => {
      const result = validate((f) => {
        electionConfig(f).election = "mayoral";
      });
      expect(result).toEqual([
        expect.objectContaining({
          code: "election-config-invalid",
          path: "/election",
        }),
      ]);
    });

    it("rejects an unknown result rule", () => {
      const result = validate((f) => {
        electionConfig(f).election = { type: "mayoral", resultRule: "runoff" };
      });
      expect(result).toEqual([
        expect.objectContaining({
          code: "election-config-invalid",
          path: "/election/resultRule",
        }),
      ]);
    });

    it("warns when a parliamentary election sets a result rule", () => {
      const result = validate((f) => {
        electionConfig(f).election = {
          type: "parliamentary",
          resultRule: "plurality",
        };
      });
      expect(codes(result)).toEqual(["warning:result-rule-ignored"]);
    });
  });
});
