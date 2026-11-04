import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const campaignDir = join(here, "../../public/campaigns/2024_budapest");
const sideDir = join(campaignDir, "fidesz_kdnp/szentkiralyi_alexandra");

const K = "karacsony_gergely";
const V = "vitezy_david";
const SZ = "szentkiralyi_alexandra";
const G = "grundtner_andras";
const KEYS = { K, V, Sz: SZ, G };

export const TUNING = {
  szentkiralyiGain: 1.1,
  szentkiralyiLoss: 1.0,
  vitezyGain: 0.9,
  vitezyLoss: 0.9,
  karacsonyGain: 0.7,
  karacsonyLoss: 1.0,
  karacsonyDrift: 0.1,
  vitezyDrift: 0.2,
  szentkiralyiDrift: 0,
};

const zone = (group, amount, from = "bizonytalan") => [group, amount, from];

const ANSWERS = {
  "01": {
    A: { Sz: 0.2, K: 0.2 },
    B: { Sz: 0.6, V: -0.1 },
    C: { Sz: -0.1, K: 0.1 },
    D: { Sz: 0.1, K: 0.2 },
  },
  "02": {
    A: { Sz: 0.2 },
    B: { Sz: 0.4, V: -0.1 },
    C: { Sz: 0.5, K: 0.1 },
    D: { Sz: -0.1, V: 0.1 },
  },
  "03": {
    A: { Sz: 0.3, K: 0.3 },
    B: { Sz: 0.6, V: -0.2 },
    C: { Sz: -0.1, K: 0.1 },
    D: { Sz: 0.3, V: 0.2, K: 0.1 },
  },
  "04": {
    A: { Sz: 0.3, K: 0.3 },
    B: { Sz: 0.6, V: -0.2 },
    C: { Sz: 0.4, K: 0.2, V: 0.1 },
    D: { Sz: 0.4, V: 0.2 },
  },
  "05": {
    A: { Sz: 0.4, K: 0.2 },
    B: { Sz: 0.5, V: -0.1 },
    C: { Sz: 0.5, K: -0.1 },
    D: { Sz: 0.2, V: -0.4, K: 0.2 },
  },
  "06": {
    A: { Sz: 0.5, V: 0.2 },
    B: { Sz: 0.2, K: 0.2 },
    C: { Sz: 0.3, K: -0.3, V: 0.1 },
    D: { Sz: 0.3, V: -0.4, K: 0.2 },
  },
  "07": {
    A: { Sz: 0.6, V: -0.2 },
    B: { Sz: 0.2, V: -0.1, K: 0.1 },
    C: { Sz: 0.2 },
    D: { Sz: 0.2, V: -0.3, K: 0.1 },
  },
  "08": {
    A: { Sz: 0.2, K: 0.2 },
    B: { Sz: 0.6 },
    C: { Sz: 0.3 },
    D: { Sz: 0.3, V: 0.1 },
  },
  "09": {
    A: { Sz: 0.6 },
    B: { Sz: 0.2, K: 0.2 },
    C: { Sz: 0.3, V: 0.2, G: -0.1 },
    D: { Sz: 0.4 },
  },
  10: {
    A: { Sz: 0.4, G: -0.2, K: 0.2 },
    B: { Sz: 0.4, V: -0.1 },
    C: { Sz: 0.3, K: 0.2 },
    D: { Sz: 0.3, V: -0.3, K: 0.1 },
  },
  11: {
    A: { Sz: 0.1, K: 0.1 },
    B: { Sz: 0.4 },
    C: { Sz: 0.3 },
    D: { Sz: 0.1, V: -0.1 },
  },
  12: {
    A: { Sz: 0.3, K: 0.4 },
    B: { Sz: 0.5 },
    C: { Sz: 0.4, K: 0.1 },
    D: { Sz: 0.3, V: 0.1 },
  },
  13: {
    A: { Sz: 0.3, K: 0.1 },
    B: { Sz: 0.4 },
    C: { Sz: 0.1, K: 0.2 },
    D: { Sz: -0.2 },
  },
  14: {
    A: { zones: [zone("peremkerulet", 600)] },
    B: { zones: [zone("atmeneti", 500), zone("atmeneti", 200, V)] },
    C: { zones: [zone("belvaros", 500, K)] },
    D: { Sz: 0.3 },
  },
  15: {
    A: { Sz: 0.3, K: 0.2 },
    B: { Sz: 0.7, K: -0.1 },
    C: { Sz: 0.1, K: 0.3 },
    D: { Sz: 0.4, V: 0.1 },
  },
  16: {
    A: { Sz: 0.3, V: 0.2 },
    B: { Sz: 0.2, V: -0.5, K: 0.2 },
    C: { Sz: 0.6, V: -0.1 },
    D: { Sz: 0.4 },
  },
  17: {
    A: { Sz: 0.3, K: 0.1 },
    B: { Sz: 0.6, K: -0.1 },
    C: { Sz: 0.1, V: -0.2, K: -0.2 },
    D: { Sz: 0.4 },
  },
  18: {
    A: { Sz: 0.4, G: -0.3, K: 0.3 },
    B: { Sz: 0.5, G: -0.1 },
    C: { Sz: 0.1, K: 0.2 },
    D: { Sz: 0.3, V: 0.2 },
  },
  19: {
    A: { Sz: 0.3, K: 0.3 },
    B: { Sz: 0.6, V: -0.1 },
    C: { Sz: 0.3, V: -0.3, K: 0.1 },
    D: { Sz: -0.1 },
  },
  20: {
    A: { Sz: -0.1, K: 0.1 },
    B: { Sz: 0.6, V: -0.1 },
    C: { Sz: 0.2 },
    D: { Sz: 0.4 },
  },
  21: {
    A: { Sz: 0.5 },
    B: { Sz: -0.2, K: 0.1 },
    C: { Sz: -0.1 },
    D: { Sz: 0.2, V: -0.2, K: 0.2 },
  },
  22: {
    A: { Sz: 0.2, K: -0.3, V: 0.3 },
    B: { Sz: 0.3, V: -0.5, K: 0.3 },
    C: { Sz: 0.3 },
    D: { Sz: 0.2, V: -0.2, K: -0.1 },
  },
  23: {
    A: { Sz: 0.1, K: 0.1 },
    B: { Sz: 0.5 },
    C: { Sz: 0.3, K: -0.2, V: 0.1 },
    D: {},
  },
  "24_vita": {
    A: { Sz: 0.8, K: -0.1 },
    B: { Sz: -0.2, K: 0.2 },
    C: { Sz: 0.4, K: -0.4, V: 0.3 },
    D: { Sz: 0.4, V: -0.5, K: 0.3 },
  },
  "24_nelkul": {
    A: { Sz: -0.1, K: 0.1 },
    B: { Sz: 0.3 },
    C: { Sz: 0.2, V: -0.2, K: -0.1 },
    D: { Sz: -0.2 },
  },
  25: {
    A: { Sz: 0.3, K: 0.3 },
    B: { Sz: 0.6 },
    C: { Sz: 0.5 },
    D: { Sz: 0.1, K: 0.2 },
  },
  26: {
    A: { Sz: 0.6, V: -0.2 },
    B: { Sz: -0.3, V: 0.3 },
    C: { Sz: 0.2, V: -0.1 },
    D: { Sz: 0.1 },
  },
  27: {
    A: { Sz: 0.6 },
    B: { Sz: 0.3, K: 0.3 },
    C: { Sz: 0.3, V: -0.4, K: 0.2 },
    D: { Sz: 0.2, K: 0.2 },
  },
  28: {
    A: { Sz: 0.4, V: -0.4, K: 0.1 },
    B: { Sz: 0.5, K: 0.2 },
    C: { V: -0.5, K: 0.2 },
    D: { Sz: 0.4 },
  },
  29: {
    A: { Sz: 0.3, K: 0.1 },
    B: { Sz: 0.6, V: -0.2 },
    C: { Sz: 0.1 },
    D: { Sz: 0.3, V: -0.3 },
  },
  30: {
    A: { Sz: 0.4, V: 0.1 },
    B: { V: 0.3 },
    C: { Sz: 0.1, K: -0.3, V: 0.3 },
    D: { Sz: 0.3, V: 0.1 },
  },
  31: {
    A: { Sz: 0.6 },
    B: { Sz: 0.3, K: 0.3 },
    C: { Sz: 0.4, V: 0.1 },
    D: { Sz: 0.4, V: -0.3, K: 0.1 },
  },
  32: {
    A: { zones: [zone("peremkerulet", 800)] },
    B: { zones: [zone("atmeneti", 700)] },
    C: { zones: [zone("belvaros", 500, K)] },
    D: { Sz: 0.4 },
  },
};

const CONDITIONAL = [
  ["09", "A", [["08", "B"]], { Sz: 0.2 }],
  ["25", "B", [["02", "C"]], { Sz: 0.3 }],
  ["30", "D", [["11", "B"]], { Sz: 0.3 }],
  ["31", "A", [["12", "A"]], { Sz: -0.2 }],
  ["31", "B", [["12", "A"]], { Sz: 0.2 }],
];

const questionId = (key) => `bp2024_szentkiralyi_${key}`;

const round = (value) => Math.round(value * 1000) / 1000;

function scaled(swing, { drift = false } = {}) {
  const raw = { ...swing };
  const scale = (key, gain, loss) => {
    if (raw[key] > 0) raw[key] *= gain;
    if (raw[key] < 0) raw[key] *= loss;
  };
  scale("Sz", TUNING.szentkiralyiGain, TUNING.szentkiralyiLoss);
  scale("V", TUNING.vitezyGain, TUNING.vitezyLoss);
  scale("K", TUNING.karacsonyGain, TUNING.karacsonyLoss);
  if (drift) {
    raw.K = (raw.K ?? 0) + TUNING.karacsonyDrift;
    raw.V = (raw.V ?? 0) + TUNING.vitezyDrift;
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
        targetParty: SZ,
        amount,
        from: source(from),
      })),
    });
  }
  return effects;
}

const keyOf = (id) => id.replace("bp2024_szentkiralyi_", "");

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
          effects: effectsOf(spec[id], { drift: true }),
          ...(conditionalEffects.length ? { conditionalEffects } : {}),
        };
      }),
    };
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const questions = JSON.parse(
    readFileSync(join(sideDir, "questions.json"), "utf8"),
  );
  writeFileSync(
    join(sideDir, "answer_effects.json"),
    `${JSON.stringify(buildAnswerEffects(questions), null, 2)}\n`,
  );
}
