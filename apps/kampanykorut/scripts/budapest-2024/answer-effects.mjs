import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const campaignDir = join(here, "../../public/campaigns/2024_budapest");
const sideDir = join(campaignDir, "lmp/vitezy_david");

const K = "karacsony_gergely";
const V = "vitezy_david";
const SZ = "szentkiralyi_alexandra";
const G = "grundtner_andras";
const KEYS = { K, V, Sz: SZ, G };

export const TUNING = {
  vitezyGain: 0.4,
  karacsonyLoss: 0.5,
  karacsonyGain: 0.7,
  szentkiralyiGain: 0.35,
  karacsonyDrift: 0.15,
  szentkiralyiDrift: 0.22,
};

export const WITHDRAWAL = {
  turn: 26,
  minGapBehind: 0.03,
  maxVitezyGapBehind: 0.15,
  redistribution: {
    [V]: 0.55,
    [G]: 0.04,
    [K]: 0.03,
    _abstain: 0.38,
  },
  karacsonyMobilization: 3,
};

const GROUPS = {
  belvaros: ["Belső kerületek", [1, 5, 6, 7, 8, 9, 13]],
  atmeneti: ["Átmeneti övezet", [2, 3, 4, 10, 11, 12, 14]],
  peremkerulet: ["Peremkerületek", [15, 16, 17, 18, 19, 20, 21, 22, 23]],
};

const zone = (group, amount, from = "bizonytalan") => [group, amount, from];

const ANSWERS = {
  "01": {
    A: { V: 0.8, K: -0.2 },
    B: { V: 0.4, K: -0.1 },
    C: { V: 0.5, K: -0.2, Sz: -0.1 },
    D: { V: 0.2, K: 0.2 },
  },
  "02": {
    A: { V: 0.3, K: -0.1 },
    B: { V: 0.1, K: 0.3 },
    C: { V: 0.1, K: -0.3, Sz: -0.1 },
    D: { V: 0.4, K: 0.1 },
  },
  "03": {
    A: { V: 0.6, K: -0.2, Sz: 0.2 },
    B: { V: 0.4, Sz: -0.4, K: 0.2 },
    C: { V: 0.6, Sz: -0.2, K: -0.1 },
    D: { V: -0.3, K: 0.2 },
  },
  "04": {
    A: { V: 0.5, K: 0.1 },
    B: { V: 0.5 },
    C: { V: 0.3 },
    D: { V: -0.6, Sz: 0.1 },
  },
  "05": {
    A: { V: 0.5 },
    B: { V: 0.7, K: -0.1, Sz: -0.1 },
    C: { V: 0.6, Sz: -0.6, K: 0.4 },
    D: { V: 0.6, K: -0.6, Sz: 0.2 },
  },
  "06": {
    A: { V: 0.4, K: -0.1 },
    B: { V: 0.2, K: 0.1 },
    C: { V: -0.1 },
    D: { V: 0.2, Sz: -0.4, K: 0.2 },
  },
  "07": {
    A: { V: 0.5, K: -0.1 },
    B: { V: 0.3 },
    C: { V: 0.2, Sz: -0.3, K: 0.2 },
    D: { V: 0.3, K: 0.1 },
  },
  "08": {
    A: { V: 0.6, Sz: -0.5, K: 0.2 },
    B: { V: 0.4, K: -0.2, Sz: -0.1 },
    C: { V: 0.2, Sz: -0.2 },
    D: { V: 0.2 },
  },
  "09": {
    A: { V: 0.4, K: -0.3, Sz: 0.3 },
    B: { V: 0.4, Sz: -0.2, K: 0.2 },
    C: { V: -0.1, K: 0.2 },
    D: { V: 0.2, districts: [[10, 2500]] },
  },
  10: {
    A: { V: 0.3 },
    B: { V: 0.6 },
    C: { V: 0.3, zones: [zone("peremkerulet", 400)] },
    D: { V: 0.5 },
  },
  11: {
    A: { V: 0.6, Sz: -0.4, K: 0.1 },
    B: { V: -0.1, K: 0.1 },
    C: { V: 0.4, K: -0.2 },
    D: { V: 0.3, Sz: -0.2, G: -0.1 },
  },
  12: {
    A: { V: 0.4, K: -0.2 },
    B: { V: 0.1, K: -0.2 },
    C: { V: 0.4, K: -0.2 },
    D: { V: -0.1, Sz: -0.3 },
  },
  13: {
    A: { V: 0.2, Sz: -0.2, K: 0.2 },
    B: { V: 0.0, K: -0.2 },
    C: { V: 0.4, K: -0.2 },
    D: { V: -0.4, K: 0.2 },
  },
  14: {
    A: {
      K: 0.1,
      zones: [zone("peremkerulet", 600), zone("peremkerulet", 300, SZ)],
    },
    B: { zones: [zone("belvaros", 700, K)] },
    C: { zones: [zone("atmeneti", 600), zone("atmeneti", 200, K)] },
    D: { V: 0.7, K: -0.1 },
  },
  15: {
    A: { V: 0.6, Sz: -0.4, G: -0.2, K: 0.2 },
    B: { V: 0.1, G: -0.1, zones: [zone("peremkerulet", 400)] },
    C: { V: -0.1, K: 0.3, G: -0.1 },
    D: { V: 0.3 },
  },
  16: {
    A: { V: 0.4, Sz: -0.2, K: 0.1 },
    B: { V: 0.5, K: -0.3 },
    C: { V: 0.2, K: -0.3 },
    D: { V: 0.1, Sz: 0.3, K: -0.2 },
  },
  17: {
    A: { V: 0.4, K: -0.4 },
    B: { V: 0.4, K: -0.3, Sz: 0.2 },
    C: { V: -0.2 },
    D: { V: 0.5 },
  },
  18: {
    A: { V: 0.5, Sz: -0.3, K: 0.1 },
    B: { V: 0.4, K: -0.4, Sz: 0.2 },
    C: { V: 0.3, K: -0.2, Sz: 0.1 },
    D: { V: 0.1 },
  },
  19: {
    A: { V: 0.4, K: -0.3 },
    B: { V: 0.5, Sz: -0.3, K: 0.1 },
    C: { V: 0.4, Sz: -0.6, K: 0.3 },
    D: { V: -0.1 },
  },
  20: {
    A: { V: 1.0, K: -0.2, Sz: 0.4 },
    B: { V: -0.3, K: 0.4 },
    C: { V: 0.2, Sz: -0.3, K: 0.3 },
    D: { V: -0.2, K: 0.2 },
  },
  21: {
    A: { V: 0.1 },
    B: { V: -0.1, K: 0.1 },
    C: { V: 0.1, Sz: -0.6, K: 0.6 },
    D: { V: -0.3, K: 0.2 },
  },
  22: {
    A: { V: 0.4, K: -0.5 },
    B: { K: 0.3 },
    C: { V: 0.3, zones: [zone("peremkerulet", 300)] },
    D: { V: 0.1, Sz: -0.4, G: -0.1, K: 0.4 },
  },
  23: {
    A: { V: 0.7, K: -0.4, Sz: -0.3 },
    B: { V: 0.5, K: 0.2 },
    C: { V: 0.8, K: -0.6, Sz: 0.4 },
    D: { V: 0.4, K: -0.4 },
  },
  24: {
    A: { V: 0.2, K: -0.1 },
    B: { V: 0.2, K: 0.3 },
    C: { V: 0.3, K: -0.3 },
    D: { V: 0.5, K: -0.4 },
  },
  25: {
    A: { V: 0.2, Sz: -0.2, K: 0.1 },
    B: { V: 0.7, Sz: -0.8, K: 0.5 },
    C: { V: 0.6, K: -0.4, Sz: 0.4 },
    D: { V: -0.2, K: 0.3 },
  },
  26: {
    A: { zones: [zone("peremkerulet", 700), zone("peremkerulet", 300, SZ)] },
    B: { zones: [zone("belvaros", 400, K), zone("belvaros", 300)] },
    C: { V: 0.8 },
    D: { V: -0.1, zones: [zone("atmeneti", 600), zone("atmeneti", 300, K)] },
  },
  "27_v": {
    A: { V: 0.1, K: 0.4 },
    B: { V: 1.2, K: 0.8 },
    C: { V: -2.0, K: -0.6, G: 0.3 },
    D: { V: 0.2 },
  },
  "27_n": {
    A: { V: 0.6, Sz: -0.5 },
    B: { V: 0.8, Sz: -1.0, K: 0.5 },
    C: { V: 0.5, Sz: 0.3 },
    D: { Sz: -0.2 },
  },
  "28_v": {
    A: { K: 0.2 },
    B: { V: 0.3, K: 0.3 },
    C: { K: -0.6 },
    D: { V: -0.3, K: 0.5 },
  },
  "28_n": {
    A: { V: 0.5, Sz: -0.6 },
    B: { V: 0.4, K: -0.4 },
    C: { V: 0.1, Sz: -0.3 },
    D: { K: 0.1 },
  },
  "29_v": {
    A: { V: 1.2, K: 0.4 },
    B: { V: 0.7 },
    C: { V: 1.0, K: 0.6 },
    D: { V: -0.4 },
  },
  "29_n": {
    A: { V: 0.8, Sz: -0.9, K: 0.4 },
    B: { V: 0.2, zones: [zone("peremkerulet", 500, SZ)] },
    C: { V: -0.5, K: 0.3 },
    D: { K: 0.1 },
  },
  "30_v": {
    A: { V: 0.5 },
    B: { V: 0.5, K: -0.1 },
    C: { V: 0.6, K: 0.3 },
    D: { V: 0.1, zones: [zone("peremkerulet", 300)] },
  },
  "30_n": {
    A: { V: 0.9, Sz: 0.1 },
    B: { V: 0.5, K: -0.1 },
    C: { V: 0.1, Sz: -0.4, K: 0.3 },
    D: { V: 0.1, zones: [zone("peremkerulet", 300)] },
  },
  "31_v": {
    A: { V: 0.5 },
    B: { V: 0.3, K: -0.2 },
    C: { V: 0.7, K: 0.6 },
    D: { V: 0.3, K: -0.4 },
  },
  "31_n": {
    A: { V: 0.5 },
    B: { V: 0.6, Sz: 0.3 },
    C: { V: 0.6, Sz: -0.6, K: 0.4 },
    D: { V: 0.5, K: -0.5, Sz: 0.2 },
  },
  32: {
    A: { zones: [zone("peremkerulet", 800)] },
    B: {
      zones: [
        zone("belvaros", 400),
        zone("atmeneti", 400),
        zone("belvaros", 300, null),
      ],
    },
    C: { V: 0.2 },
    D: { V: 0.1, K: 0.1 },
  },
};

const CONDITIONAL = [
  ["13", "A", [["04", "A"]], { V: -0.2 }],
  ["13", "B", [["04", "A"]], { V: 0.1 }],
  ["23", "A", [["21", "A"]], { V: 0.4, K: -0.4 }],
  ["23", "B", [["10", "A"]], { V: 0.3 }],
  ["17", "D", [["14", "D"]], { V: 0.3 }],
  ["17_lmp_nelkul", "D", [["14", "D"]], { V: 0.3 }],
  ["26", "A", [["04", "C"]], { V: -0.3 }],
  ["32", "A", [["04", "C"]], { V: -0.3 }],
  ["27_v", "A", [["25", "C"]], { V: -1.0 }],
  ["27_v", "B", [["25", "C"]], { V: -1.0 }],
  ["27_v", "D", [["25", "C"]], { V: -1.0 }],
  ["27_v", "C", [["25", "C"]], { V: 0.3 }],
  ["27_v", "B", [["25", "C"]], { V: -0.8 }],
  ["28_v", "A", [["08", "A"]], { V: -0.2, K: 0.2 }],
  ["28_v", "A", [["18", "A"]], { V: -0.2, K: 0.2 }],
  ["28_v", "A", [["25", "B"]], { V: -0.2, K: 0.2 }],
  ["28_v", "D", [["08", "A"]], { V: -0.2, K: 0.2 }],
  ["28_v", "D", [["18", "A"]], { V: -0.2, K: 0.2 }],
  ["28_v", "D", [["25", "B"]], { V: -0.2, K: 0.2 }],
  ["28_v", "A", [["27_v", "B"]], { V: -0.2, K: 0.2 }],
  ["28_v", "D", [["27_v", "B"]], { V: -0.2, K: 0.2 }],
  ["32", "C", [["29_v", "D"]], { V: 0.6 }],
];

const STRATEGIES = [
  {
    id: "varosmernok",
    label: "Budapest működjön",
    conditions: ["05A", "14C", "23B", "26D", "31A", "10A", "16A", "18A"],
    rewards: [
      [4, { V: 1.1 }],
      [6, { V: 2.8, K: -0.3 }],
    ],
  },
  {
    id: "ellenzekvaltas",
    label: "Ellenzékváltás",
    conditions: ["05B", "14D", "23C", "26C", "31B", "20A", "30A"],
    rewards: [
      [4, { V: 1.3, K: -0.5 }],
      [6, { V: 3.0, K: -1.2 }],
    ],
  },
  {
    id: "karacsony_valtas",
    label: "Karácsony-váltás",
    conditions: ["05C", "14A", "23A", "26A", "31C", "08A", "11A", "15A"],
    rewards: [
      [4, { V: 1.6, Sz: -0.5 }],
      [6, { V: 3.9, Sz: -1.0 }],
    ],
  },
  {
    id: "zold_orokseg",
    label: "Amit megígértek, megépítem",
    conditions: ["05D", "14B", "23D", "26B", "31D", "13C", "16B", "22A"],
    rewards: [
      [4, { V: 0.7, K: -0.2 }],
      [6, { V: 1.8, K: -0.6 }],
    ],
  },
];

const BRANCHED = new Set(["30", "31"]);

const questionId = (key) => `bp2024_vitezy_${key}`;

const round = (value) => Math.round(value * 1000) / 1000;

function scaled(swing, { drift = false, reward = false } = {}) {
  const raw = { ...swing };
  if (!reward) {
    if (raw.V > 0) raw.V *= TUNING.vitezyGain;
    if (raw.K < 0) raw.K *= TUNING.karacsonyLoss;
    if (raw.K > 0) raw.K *= TUNING.karacsonyGain;
  }
  if (raw.Sz > 0) raw.Sz *= TUNING.szentkiralyiGain;
  if (drift) {
    raw.K = (raw.K ?? 0) + TUNING.karacsonyDrift;
    raw.Sz = (raw.Sz ?? 0) + TUNING.szentkiralyiDrift;
  }
  return Object.fromEntries(
    Object.entries(raw)
      .map(([key, value]) => [KEYS[key], round(value)])
      .filter(([, value]) => value !== 0),
  );
}

const source = (from) =>
  from === "bizonytalan"
    ? { type: "bizonytalan" }
    : { type: "party", party: from };

function effectsOf(spec, options = {}) {
  const { zones = [], districts = [], ...swing } = spec;
  const effects = [];
  const params = scaled(swing, options);
  if (Object.keys(params).length) {
    effects.push({ type: "uniform-swing", params });
  }
  const transfers = [
    ...zones
      .filter(([, , from]) => from !== null)
      .map(([groupId, amount, from]) => ({
        groupId,
        targetParty: V,
        amount,
        from: source(from),
      })),
    ...zones
      .filter(([, , from]) => from === null)
      .map(([groupId, amount]) => ({
        groupId,
        targetParty: K,
        amount,
        from: source("bizonytalan"),
      })),
  ];
  if (transfers.length) {
    effects.push({ type: "district-vote-transfer", params: transfers });
  }
  if (districts.length) {
    effects.push({
      type: "district-vote-transfer",
      params: districts.map(([oevk, amount]) => ({
        megyekod: 1,
        oevk,
        targetParty: V,
        amount,
        from: source("bizonytalan"),
      })),
    });
  }
  return effects;
}

function specFor(id) {
  const key = id.replace("bp2024_vitezy_", "");
  return ANSWERS[key === "17_lmp_nelkul" ? "17" : key];
}

export function buildAnswerEffects(questions) {
  return questions.map((question) => {
    const spec = specFor(question.id);
    const key = question.id.replace("bp2024_vitezy_", "");
    return {
      id: question.id,
      answers: question.possibleAnswers.map(({ id }) => {
        const conditionalEffects = CONDITIONAL.filter(
          ([q, a]) => q === key && a === id,
        ).map(([, , when, effect]) => ({
          if: when.map(([q, a]) => ({
            questionId: questionId(q),
            answerId: a,
          })),
          mode: "merge",
          effects: effectsOf(effect),
        }));
        return {
          id,
          effects: effectsOf(spec[id], { drift: true }),
          ...(conditionalEffects.length ? { conditionalEffects } : {}),
        };
      }),
    };
  });
}

export function buildStrategies() {
  return STRATEGIES.map(({ id, label, conditions, rewards }) => ({
    id,
    label,
    target: { party: "lmp", candidate: V },
    conditions: conditions.flatMap((condition) => {
      const number = condition.slice(0, 2);
      const answerId = condition.slice(2);
      const ids = BRANCHED.has(number)
        ? [`${number}_v`, `${number}_n`]
        : [number];
      return ids.map((key) => ({ questionId: questionId(key), answerId }));
    }),
    rewards: rewards.map(([minMatches, effect]) => ({
      minMatches,
      effects: effectsOf(effect, { reward: true }),
    })),
  }));
}

export function buildGroups() {
  return Object.entries(GROUPS).map(([id, [label, districts]]) => ({
    id,
    label,
    districts: districts.map((oevk) => ({ megyekod: 1, oevk })),
  }));
}

export function buildEvents() {
  const decisionTurn = {
    type: "turn",
    min: WITHDRAWAL.turn,
    max: WITHDRAWAL.turn,
  };
  const inRace = {
    type: "candidate-status",
    candidateId: SZ,
    status: "active",
  };
  return [
    {
      id: "szentkiralyi_alexandra_withdrawal",
      label: "Szentkirályi Alexandra visszalép",
      once: true,
      priority: 100,
      conditions: [
        {
          if: {
            and: [
              decisionTurn,
              inRace,
              {
                type: "candidate-rank",
                candidateId: SZ,
                min: 3,
                minGapBehind: WITHDRAWAL.minGapBehind,
              },
              {
                type: "candidate-rank",
                candidateId: V,
                max: 2,
                maxGapBehind: WITHDRAWAL.maxVitezyGapBehind,
              },
            ],
          },
          effects: [
            {
              type: "withdraw-candidate",
              candidateId: SZ,
              endorsedCandidateId: V,
              redistribution: WITHDRAWAL.redistribution,
            },
            {
              type: "uniform-swing",
              params: { [K]: WITHDRAWAL.karacsonyMobilization },
            },
          ],
        },
      ],
      announcement: {
        title: "Szentkirályi Alexandra visszalép",
        body: "Június 7., péntek reggel: Szentkirályi Alexandra visszalép a főpolgármester-választástól, és arra kéri a támogatóit, hogy Vitézy Dávidra szavazzanak. Két nap van hátra, és a verseny kétszereplőssé vált.",
      },
    },
    {
      id: "szentkiralyi_alexandra_stays",
      label: "Szentkirályi Alexandra versenyben marad",
      once: true,
      priority: 50,
      conditions: [{ if: { and: [decisionTurn, inRace] }, effects: [] }],
      announcement: {
        title: "Szentkirályi Alexandra versenyben marad",
        body: "Június 7., péntek: lejárt a visszalépési határidő, Szentkirályi Alexandra versenyben maradt. A Fidesz a saját jelöltjét és listáját mozgósítja, a verseny két nappal a választás előtt is háromszereplős marad.",
      },
    },
  ];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const questions = JSON.parse(
    readFileSync(join(sideDir, "questions.json"), "utf8"),
  );
  const write = (file, data) =>
    writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  write(join(sideDir, "answer_effects.json"), buildAnswerEffects(questions));
  write(join(sideDir, "campaign_strategies.json"), buildStrategies());
  write(join(campaignDir, "custom_groups.json"), buildGroups());
  write(join(campaignDir, "campaign_events.json"), buildEvents());
}
