import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Answer effects and strategies for the Karácsony side of 2024_budapest.
// The shared files (campaign_events.json, custom_groups.json) are written by
// answer-effects.mjs; this script only writes the Karácsony side's own files.

const here = dirname(fileURLToPath(import.meta.url));
const campaignDir = join(here, "../../public/campaigns/2024_budapest");
const sideDir = join(campaignDir, "dk_mszp_parbeszed/karacsony_gergely");

const K = "karacsony_gergely";
const V = "vitezy_david";
const SZ = "szentkiralyi_alexandra";
const G = "grundtner_andras";
const KEYS = { K, V, Sz: SZ, G };

export const TUNING = {
  karacsonyGain: 0.4,
  karacsonyLoss: 0.6,
  vitezyGain: 0.9,
  vitezyLoss: 0.9,
  szentkiralyiGain: 1.0,
  szentkiralyiLoss: 0.8,
  vitezyDrift: 0.28,
  szentkiralyiDrift: 0.18,
  karacsonyDrift: 0,
  // While Szentkirályi stays in the race, part of her voters move to Vitézy
  // tactically every turn (percentage points, not scaled).
  tacticalVitezy: 1.6,
  tacticalSzentkiralyi: -1.0,
};

const zone = (group, amount, from = "bizonytalan") => [group, amount, from];

// Relative size and direction of each answer, before TUNING. K is the player:
// positive K mobilizes Karácsony voters, negative V or Sz sends a rival's
// voters back to the undecided pool.
const ANSWERS = {
  "01": {
    A: { K: 0.3, V: 0.2 },
    B: { K: 0.5, V: -0.2 },
    C: { K: 0.2, V: -0.2 },
    D: { K: -0.5, V: 0.6, Sz: 0.2 },
  },
  "02": {
    A: { K: 0.4, V: 0.1 },
    B: { K: 0.1 },
    C: { K: 0.2, V: 0.3, Sz: 0.2 },
    D: { K: -0.1, V: 0.1 },
  },
  "03": {
    A: { K: 0.3 },
    B: { K: -0.1, V: 0.1 },
    C: { K: 0.2, V: -0.1 },
    D: { K: 0.1, V: 0.2 },
  },
  "04": {
    A: { K: 0.6, Sz: 0.2 },
    B: { K: 0.3 },
    C: { K: 0.5 },
    D: { K: 0.3, V: -0.1 },
  },
  "05": {
    A: { K: 0.4, V: -0.1 },
    B: { K: 0.1 },
    C: { K: -0.3, V: 0.2, Sz: 0.2 },
    D: { K: 0.2, Sz: 0.1 },
  },
  "06": {
    A: { K: 0.3, Sz: 0.5, V: -0.2 },
    B: { K: 0.3, Sz: -0.4 },
    C: { K: 0.1, V: 0.2 },
    D: { K: 0.2, Sz: 0.3 },
  },
  "07": {
    A: { K: 0.3, V: -0.2 },
    B: { K: 0.1, V: 0.1 },
    C: { V: 0.4 },
    D: { K: -0.1, V: -0.3 },
  },
  "08": {
    A: { K: 0.1, V: -0.1 },
    B: { K: 0.1, V: 0.4 },
    C: { K: 0.2, Sz: 0.4, V: -0.1 },
    D: { K: -0.2, V: 0.1 },
  },
  "09": {
    A: { K: 0.3 },
    B: { K: -0.1, V: 0.2 },
    C: { K: 0.4 },
    D: { K: 0.1, V: -0.2 },
  },
  10: {
    A: { K: 0.4, V: 0.3 },
    B: { K: 0.2, V: 0.1 },
    C: { K: 0.1, V: -0.3 },
    D: { K: 0.2 },
  },
  11: {
    A: { K: 0.4, Sz: 0.2 },
    B: { K: 0.1, V: 0.1 },
    C: { K: 0.2 },
    D: { K: 0.3, V: -0.1 },
  },
  12: {
    A: { K: 0.4, Sz: 0.2 },
    B: { V: 0.2 },
    C: { K: 0.3 },
    D: { K: -0.2, V: 0.3 },
  },
  13: {
    A: { K: 0.2, V: -0.2 },
    B: { K: 0.2, V: -0.4 },
    C: { K: 0.2, V: 0.2 },
    D: { K: 0.1, V: 0.2 },
  },
  14: {
    A: { zones: [zone("belvaros", 600)] },
    B: { zones: [zone("atmeneti", 600)] },
    C: { K: 0.3 },
    D: { K: 0.2, V: -0.2 },
  },
  15: {
    A: { K: 0.1, V: 0.3 },
    B: { K: 0.3, V: -0.1 },
    C: { K: -0.1, V: -0.4 },
    D: { K: 0.2 },
  },
  16: {
    A: { K: 0.2, V: 0.3, Sz: 0.1 },
    B: { K: 0.2, V: -0.2, zones: [zone("peremkerulet", 300)] },
    C: { K: 0.1, V: -0.3 },
    D: { K: 0.2 },
  },
  17: {
    A: { K: 0.3, V: -0.1 },
    B: { K: -0.2, V: 0.2 },
    C: { K: 0.1 },
    D: { K: -0.1, Sz: 0.1 },
  },
  18: {
    A: { K: 0.2, V: -0.3 },
    B: { K: 0.3, V: -0.2 },
    C: { V: 0.1 },
    D: { K: 0.1, V: -0.2 },
  },
  19: {
    A: { K: 0.5 },
    B: { K: 0.3 },
    C: { K: 0.2, V: -0.1 },
    D: { K: 0.3, V: 0.1 },
  },
  20: {
    A: { K: 0.4, V: -0.2 },
    B: { K: -0.2, V: 0.6 },
    C: { V: 0.3 },
    D: { K: 0.3, V: -0.1 },
  },
  21: {
    A: { K: 0.1, V: 0.2 },
    B: { K: 0.3, V: -0.2 },
    C: {},
    D: { K: 0.1, V: 0.3 },
  },
  22: {
    A: { K: 0.3, Sz: 0.5, V: -0.2 },
    B: { K: 0.2, V: -0.4, Sz: 0.1 },
    C: { K: 0.2, V: 0.2 },
    D: { K: 0.3, V: -0.2, Sz: -0.1 },
  },
  23: {
    A: { K: 0.2, V: 0.3 },
    B: { K: 0.3, V: 0.1 },
    C: { K: 0.2, V: -0.2 },
    D: { K: 0.3, V: -0.2 },
  },
  24: {
    A: { K: 0.3, V: -0.2 },
    B: { K: 0.1, V: -0.1 },
    C: { K: 0.2, V: -0.3 },
    D: { K: 0.1, V: 0.2 },
  },
  25: {
    A: { K: 0.3, V: -0.1 },
    B: { K: 0.2, Sz: 0.6 },
    C: { V: 0.2 },
    D: { K: 0.1, V: 0.1 },
  },
  26: {
    A: { K: 0.2, zones: [zone("atmeneti", 400)] },
    B: { zones: [zone("belvaros", 700)] },
    C: { K: 0.2, V: -0.3 },
    D: { zones: [zone("peremkerulet", 600)] },
  },
  "27_v": {
    A: { K: 0.4, V: -0.2 },
    B: { K: 0.3, V: -0.6 },
    C: { K: 0.2 },
    D: { K: 0.3, V: -0.3 },
  },
  "27_n": {
    A: { K: 0.5 },
    B: { K: 0.3, Sz: 0.4, V: -0.2 },
    C: { K: 0.3, V: -0.3 },
    D: { K: -0.3, V: 1.0, Sz: -1.0 },
  },
  "28_v": {
    A: { K: 0.4, V: -0.1 },
    B: { K: 0.2 },
    C: { K: 0.4, V: -0.2 },
    D: { K: 0.1, V: -0.3 },
  },
  "28_n": {
    A: { K: 0.2 },
    B: { K: 0.3, V: -0.4 },
    C: { K: 0.2, Sz: 0.4, V: -0.3 },
    D: { K: 0.2, V: 0.6, Sz: -0.8 },
  },
  "29_v": {
    A: { K: 0.1, V: 0.3 },
    B: { K: 0.6 },
    C: { K: 0.2 },
    D: { K: 0.2, V: -0.1 },
  },
  "29_n": {
    A: { K: 0.1 },
    B: { K: 0.2 },
    C: { K: 0.4, V: -0.2 },
    D: { K: 0.2 },
  },
  "30_v": {
    A: { K: 0.3 },
    B: { K: 0.1 },
    C: { K: 0.5, V: -0.1 },
    D: { K: -0.3, V: 0.2 },
  },
  "30_n": {
    A: { K: 0.3, V: -0.1 },
    B: { K: 0.1 },
    C: { K: 0.4, V: -0.1 },
    D: { K: -0.3, V: 0.3 },
  },
  "31_v": {
    A: { K: 0.4 },
    B: { K: 0.3 },
    C: { K: 0.4, V: -0.2 },
    D: { K: 0.2, V: 0.1 },
  },
  "31_n": {
    A: { K: 0.4, Sz: 0.2 },
    B: { K: 0.3 },
    C: { K: 0.3, V: -0.1 },
    D: { K: 0.3 },
  },
  32: {
    A: { zones: [zone("belvaros", 600), zone("atmeneti", 300)] },
    B: { zones: [zone("peremkerulet", 600)] },
    C: { K: 0.2 },
    D: { K: 0.2, V: 0.1 },
  },
};

// [question, answer, earlier answers that must all have been chosen, effect]
const CONDITIONAL = [
  // The "Fidesz candidate" frame, built early, pays off after the withdrawal:
  // fewer of Vitézy's opposition voters follow him into the two-way race.
  ["27_v", "A", [["07", "A"]], { V: -0.4 }],
  ["27_v", "A", [["25", "A"]], { V: -0.3 }],
  ["27_v", "B", [["07", "A"]], { V: -0.3 }],
  ["25", "A", [["07", "A"]], { K: 0.2 }],
  // Overdoing the attacks backfires on the undecided.
  ["28_v", "A", [["13", "A"]], { K: -0.3, V: 0.3 }],
  ["28_v", "A", [["18", "A"]], { K: -0.3, V: 0.3 }],
  ["15", "C", [["13", "A"]], { K: -0.2, V: 0.2 }],
  // Owning a mistake early makes later admissions credible.
  ["23", "D", [["01", "B"]], { K: 0.3 }],
  ["24", "A", [["01", "B"]], { K: 0.2 }],
  // Alliance choices.
  ["21", "A", [["10", "A"]], { K: 0.2 }],
  ["20", "A", [["10", "A"]], { K: -0.3 }],
];

const STRATEGIES = [
  {
    id: "budapest_vedelme",
    label: "Budapest megvédése",
    conditions: ["04A", "14C", "23A", "26A", "31A", "11A", "12A", "22A"],
    rewards: [
      [4, { K: 1.2 }],
      [6, { K: 2.8, V: -0.5 }],
    ],
    badge: "badge-budapest-vedelme.svg",
  },
  {
    id: "zold_folytatas",
    label: "A zöld Budapest folytatása",
    conditions: ["04C", "14A", "23B", "26B", "31B", "16A", "19A", "09C"],
    rewards: [
      [4, { K: 1.0 }],
      [6, { K: 2.4, V: -0.4 }],
    ],
    badge: "badge-zold-folytatas.svg",
  },
  {
    id: "uj_korszak",
    label: "Az új politikai korszak",
    conditions: ["04D", "14D", "23C", "26C", "31C", "20A", "21B", "17A"],
    rewards: [
      [4, { K: 0.5, V: -0.2 }],
      [6, { K: 1.2, V: -0.5 }],
    ],
    badge: "badge-uj-korszak.svg",
  },
  {
    id: "hivatalban",
    label: "A hivatalban lévő főpolgármester",
    conditions: ["04B", "14B", "23D", "26D", "31D", "01B", "05A", "24A"],
    rewards: [
      [4, { K: 0.5 }],
      [6, { K: 1.2, V: -0.2 }],
    ],
    badge: "badge-hivatalban.svg",
  },
];

const BRANCHED = new Set(["27", "28", "29", "30", "31"]);

const questionId = (key) => `bp2024_karacsony_${key}`;

const round = (value) => Math.round(value * 1000) / 1000;

function scaled(
  swing,
  { drift = false, reward = false, tactical = false } = {},
) {
  const raw = { ...swing };
  if (!reward) {
    const scale = (key, gain, loss) => {
      if (raw[key] > 0) raw[key] *= gain;
      if (raw[key] < 0) raw[key] *= loss;
    };
    scale("K", TUNING.karacsonyGain, TUNING.karacsonyLoss);
    scale("V", TUNING.vitezyGain, TUNING.vitezyLoss);
    scale("Sz", TUNING.szentkiralyiGain, TUNING.szentkiralyiLoss);
  }
  if (drift) {
    raw.K = (raw.K ?? 0) + TUNING.karacsonyDrift;
    raw.V = (raw.V ?? 0) + TUNING.vitezyDrift;
    raw.Sz = (raw.Sz ?? 0) + TUNING.szentkiralyiDrift;
  }
  if (tactical) {
    raw.V = (raw.V ?? 0) + TUNING.tacticalVitezy;
    raw.Sz = (raw.Sz ?? 0) + TUNING.tacticalSzentkiralyi;
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
  const { zones = [], ...swing } = spec;
  const effects = [];
  const params = scaled(swing, options);
  if (Object.keys(params).length) {
    effects.push({ type: "uniform-swing", params });
  }
  if (zones.length) {
    effects.push({
      type: "district-vote-transfer",
      params: zones.map(([groupId, amount, from]) => ({
        groupId,
        targetParty: K,
        amount,
        from: source(from),
      })),
    });
  }
  return effects;
}

const keyOf = (id) => id.replace("bp2024_karacsony_", "");

export function buildAnswerEffects(questions) {
  return questions.map((question) => {
    const key = keyOf(question.id);
    const spec = ANSWERS[key];
    if (!spec) throw new Error(`No effects for ${question.id}`);
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
          effects: effectsOf(spec[id], {
            drift: true,
            tactical: key.endsWith("_n"),
          }),
          ...(conditionalEffects.length ? { conditionalEffects } : {}),
        };
      }),
    };
  });
}

export function buildStrategies() {
  return STRATEGIES.map(({ id, label, conditions, rewards, badge }) => ({
    id,
    label,
    target: { party: "dk_mszp_parbeszed", candidate: K },
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
    asset: { badge: `/images/2024_budapest/${badge}` },
  }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const questions = JSON.parse(
    readFileSync(join(sideDir, "questions.json"), "utf8"),
  );
  const write = (file, data) =>
    writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  write(join(sideDir, "answer_effects.json"), buildAnswerEffects(questions));
  write(join(sideDir, "campaign_strategies.json"), buildStrategies());
}
