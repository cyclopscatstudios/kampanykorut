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

    const toMayoral = (f: Files) => {
      const config = electionConfig(f);
      config.election = { type: "mayoral", resultRule: "plurality" };
      delete config.listSeats;
      delete config.allSeats;
      delete config.thresholdPercent;
      delete config.partyListVotes;
      config.parties.push({ id: "candidate_a", name: "A", color: "#111" });
    };

    it("accepts a mayoral election without parliamentary seat fields", () => {
      expect(validate(toMayoral)).toEqual([]);
    });

    it("does not require a mayoral side id to be a ballot entry", () => {
      const result = validate((f) => {
        toMayoral(f);
        const config = electionConfig(f);
        config.parties = config.parties.filter(
          (p: { id: string }) => p.id !== "party_a",
        );
        file(f, "side/effects.json")[0].answers = [
          {
            id: "A",
            effects: [{ type: "uniform-swing", params: { candidate_a: 1 } }],
          },
          { id: "B", effects: [] },
        ];
        file(f, "side/effects.json")[1].answers[0].effects = [];
        delete file(f, "side/effects.json")[1].answers[0].conditionalEffects;
        file(f, "side/strategies.json")[0].rewards[0].effects = [];
        file(f, "candidates.json").forEach(
          (row: { partok: Record<string, number> }) => {
            row.partok = { candidate_a: 1, party_b: 1 };
          },
        );
      });
      expect(result).toEqual([]);
    });

    it("requires every mayoral candidate to be on the ballot", () => {
      const result = validate((f) => {
        toMayoral(f);
        electionConfig(f).parties.pop();
      });
      expect(result).toEqual([
        expect.objectContaining({
          code: "mayoral-candidate-not-on-ballot",
          path: "/playableSides/0/mainCandidates",
        }),
      ]);
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
        toMayoral(f);
        electionConfig(f).election.resultRule = "runoff";
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

  describe("campaign events", () => {
    const withdrawal = () => ({
      id: "withdrawal",
      label: "Withdrawal",
      once: true,
      priority: 100,
      conditions: [
        {
          if: {
            and: [
              { type: "turn", min: 1, max: 2 },
              {
                type: "candidate-support",
                candidateId: "party_b",
                operator: "<",
                value: 0.3,
              },
              { type: "answer-selected", questionId: "q1", answerId: "A" },
            ],
          },
          effects: [{ type: "uniform-swing", params: { party_a: 1 } }],
        },
      ],
      announcement: { title: "Visszalép", body: "A mezőny megváltozott." },
    });

    const withEvents = (events: unknown) => (f: Files) => {
      file(f, "manifest.json").files.campaignEvents = "events.json";
      f["events.json"] = events;
    };

    it("accepts a valid events file", () => {
      expect(validate(withEvents([withdrawal()]))).toEqual([]);
    });

    it("reports a missing events file", () => {
      const result = validate((f) => {
        file(f, "manifest.json").files.campaignEvents = "events.json";
      });
      expect(codes(result)).toEqual(["error:file-missing"]);
    });

    it("reports invalid references inside event conditions", () => {
      const event = withdrawal();
      event.conditions[0].if = {
        and: [
          { type: "answer-selected", questionId: "q9", answerId: "A" },
          {
            type: "candidate-support",
            candidateId: "party_x",
            operator: "<",
            value: 0.3,
          },
          { not: { type: "event-triggered", eventId: "nope" } },
        ],
      } as never;

      const result = validate(withEvents([event]));

      expect(result.map((d) => `${d.code}@${d.path}`)).toEqual([
        "unknown-question@/0/conditions/0/if/and/0/questionId",
        "unknown-candidate@/0/conditions/0/if/and/1/candidateId",
        "unknown-event@/0/conditions/0/if/and/2/not/eventId",
      ]);
      expect(result.every((d) => d.file === "events.json")).toBe(true);
    });

    it("reports structural event errors", () => {
      const duplicate = withdrawal();
      const badOnce = { ...withdrawal(), id: "bad_once", once: "yes" };
      const noBranches = { ...withdrawal(), id: "empty", conditions: [] };
      const badAnnouncement = {
        ...withdrawal(),
        id: "announce",
        announcement: { title: "Only title" },
      };
      const badEffect = withdrawal();
      badEffect.id = "bad_effect";
      badEffect.conditions[0].effects = [{ type: "teleport" }] as never;

      const result = validate(
        withEvents([
          withdrawal(),
          duplicate,
          badOnce,
          noBranches,
          badAnnouncement,
          badEffect,
        ]),
      );

      expect(result.map((d) => `${d.code}@${d.path}`)).toEqual([
        "duplicate-id@/1/id",
        "event-invalid@/2/once",
        "event-invalid@/3/conditions",
        "event-invalid@/4/announcement",
        "effect-type-unknown@/5/conditions/0/effects/0",
      ]);
    });

    it("rejects a file that is not an array", () => {
      expect(codes(validate(withEvents({})))).toEqual(["error:events-invalid"]);
    });
  });

  describe("withdraw-candidate event effect", () => {
    const withdraw = (patch: object = {}) => ({
      type: "withdraw-candidate",
      candidateId: "party_b",
      endorsedCandidateId: "party_a",
      redistribution: { party_a: 0.9, _abstain: 0.1 },
      ...patch,
    });

    const setup =
      (effect: object, mayoral = true) =>
      (f: Files) => {
        if (mayoral) {
          const config = file(f, "election_config.json");
          config.election = { type: "mayoral" };
          config.parties.push({ id: "candidate_a", name: "A", color: "#111" });
        }
        file(f, "manifest.json").files.campaignEvents = "events.json";
        f["events.json"] = [
          {
            id: "withdrawal",
            conditions: [{ if: { type: "turn", min: 1 }, effects: [effect] }],
          },
        ];
      };

    const issues = (effect: object, mayoral = true) =>
      validate(setup(effect, mayoral)).map((d) => `${d.code}@${d.path}`);

    it("accepts a withdrawal in a mayoral election", () => {
      expect(issues(withdraw())).toEqual([]);
    });

    it("is only supported in mayoral elections", () => {
      expect(issues(withdraw(), false)).toEqual([
        "withdraw-not-supported@/0/conditions/0/effects/0",
      ]);
    });

    it("refuses to withdraw a playable candidate", () => {
      expect(issues(withdraw({ candidateId: "candidate_a" }))).toEqual([
        "withdraw-playable-candidate@/0/conditions/0/effects/0/candidateId",
      ]);
    });

    it("validates candidate references", () => {
      expect(
        issues(
          withdraw({
            candidateId: "nobody",
            endorsedCandidateId: "nobody_else",
            redistribution: { party_a: 0.5, ghost: 0.5 },
          }),
        ),
      ).toEqual([
        "unknown-candidate@/0/conditions/0/effects/0/candidateId",
        "unknown-candidate@/0/conditions/0/effects/0/endorsedCandidateId",
        "unknown-candidate@/0/conditions/0/effects/0/redistribution/ghost",
      ]);
      expect(
        issues(withdraw({ redistribution: { party_b: 0.5, party_a: 0.5 } })),
      ).toEqual([
        "unknown-candidate@/0/conditions/0/effects/0/redistribution/party_b",
      ]);
    });

    it("requires shares between 0 and 1 that add up to 1", () => {
      expect(
        issues(withdraw({ redistribution: { party_a: 0.8, _abstain: 0.1 } })),
      ).toEqual([
        "redistribution-sum@/0/conditions/0/effects/0/redistribution",
      ]);
      expect(
        issues(withdraw({ redistribution: { party_a: 1.2, _abstain: -0.2 } })),
      ).toEqual([
        "effect-invalid@/0/conditions/0/effects/0/redistribution/party_a",
        "effect-invalid@/0/conditions/0/effects/0/redistribution/_abstain",
        "redistribution-sum@/0/conditions/0/effects/0/redistribution",
      ]);
      expect(issues(withdraw({ redistribution: {} }))).toEqual([
        "effect-invalid@/0/conditions/0/effects/0/redistribution",
      ]);
    });

    it("validates the reason", () => {
      expect(issues(withdraw({ reason: "illness" }))).toEqual([
        "effect-invalid@/0/conditions/0/effects/0/reason",
      ]);
    });

    it("is not accepted as an answer effect", () => {
      const result = validate((f) => {
        effects(f)[0].answers[0].effects = [withdraw()];
      });
      expect(codes(result)).toEqual(["error:effect-type-unknown"]);
    });
  });

  describe("conditional questions", () => {
    const questionsFile = (f: Files) => file(f, "side/questions.json");
    const mayoral = (f: Files) => {
      const config = file(f, "election_config.json");
      config.election = { type: "mayoral" };
      config.parties.push({ id: "candidate_a", name: "A", color: "#111" });
    };
    const branch = (id: string, status: "active" | "inactive") => ({
      id,
      question: "?",
      possibleAnswers: [{ id: "A", label: "a" }],
      visibleIf: {
        type: "candidate-status",
        candidateId: "party_b",
        status,
      },
    });
    const issues = (mutate: (f: Files) => void) =>
      validate(mutate).map((d) => `${d.severity}:${d.code}@${d.path}`);
    const addQuestions = (
      f: Files,
      ...added: (Record<string, unknown> & { id: string })[]
    ) => {
      questionsFile(f).push(...added);
      effects(f).push(
        ...added.map(({ id }) => ({
          id,
          answers: [
            {
              id: "A",
              effects: [{ type: "uniform-swing", params: { party_a: 1 } }],
            },
          ],
        })),
      );
    };

    it("accepts a balanced branch", () => {
      expect(
        issues((f) => {
          mayoral(f);
          addQuestions(
            f,
            branch("q3", "active"),
            branch("q3_after", "inactive"),
          );
        }),
      ).toEqual([]);
    });

    it("warns when a branch does not replace every skipped question", () => {
      const result = validate((f) => {
        mayoral(f);
        addQuestions(
          f,
          branch("q3", "active"),
          branch("q4", "active"),
          branch("q3_after", "inactive"),
        );
      });

      expect(result).toEqual([
        expect.objectContaining({
          severity: "warning",
          code: "question-count-differs",
          file: "side/questions.json",
        }),
      ]);
      expect(result[0].message).toContain(
        "4 (all active), 3 (party_b inactive)",
      );
    });

    it("skips the count check when branches depend on answers", () => {
      expect(
        issues((f) => {
          mayoral(f);
          addQuestions(f, branch("q3", "active"), {
            ...branch("q4", "inactive"),
            visibleIf: {
              type: "answer-selected",
              questionId: "q1",
              answerId: "A",
            },
          });
        }),
      ).toEqual([]);
    });

    it("reports invalid references in visibleIf", () => {
      expect(
        issues((f) => {
          questionsFile(f)[1].visibleIf = {
            or: [
              { type: "answer-selected", questionId: "q9", answerId: "A" },
              { type: "event-triggered", eventId: "missing" },
            ],
          };
        }),
      ).toEqual([
        "error:unknown-question@/1/visibleIf/or/0/questionId",
        "error:unknown-event@/1/visibleIf/or/1/eventId",
      ]);
    });

    it("accepts events declared in the campaign events file", () => {
      expect(
        issues((f) => {
          file(f, "manifest.json").files.campaignEvents = "events.json";
          f["events.json"] = [
            {
              id: "withdrawal",
              conditions: [{ if: { type: "turn", min: 1 }, effects: [] }],
            },
          ];
          questionsFile(f)[1].visibleIf = {
            type: "event-triggered",
            eventId: "withdrawal",
          };
        }),
      ).toEqual([]);
    });

    it("validates requires and blocks", () => {
      expect(
        issues((f) => {
          questionsFile(f)[1].requires = [{ questionId: "q1", answerId: "Z" }];
          questionsFile(f)[0].blocks = [{ questionId: "q2", answerId: "A" }];
        }),
      ).toEqual([
        "warning:condition-not-yet-answered@/0/blocks/0",
        "error:unknown-answer@/1/requires/0/answerId",
      ]);
    });
  });
});
