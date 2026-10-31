import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const campaignDir = join(here, "../../public/campaigns/2024_budapest");

const START_POLL = {
  karacsony_gergely: 0.36,
  vitezy_david: 0.23,
  szentkiralyi_alexandra: 0.21,
  grundtner_andras: 0.04,
};

const CANDIDATES = {
  "KARÁCSONY GERGELY": { id: "karacsony_gergely", geography: "mayor" },
  "VITÉZY DÁVID": { id: "vitezy_david", geography: "assemblyList" },
  "SZENTKIRÁLYI ALEXANDRA": {
    id: "szentkiralyi_alexandra",
    geography: "assemblyList",
  },
  "GRUNDTNER ANDRÁS": { id: "grundtner_andras", geography: "mayor" },
};

const MAX_TURNOUT = 85;

const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
  "XXI",
  "XXII",
  "XXIII",
];

const source = JSON.parse(
  readFileSync(join(here, "vtr-onk2024-budapest.json"), "utf8"),
);

function listSerialOf(groupId) {
  const entry = source.assemblyListBallot.find((l) => l.groupId === groupId);
  if (!entry) {
    throw new Error(`no assembly list for group ${groupId}`);
  }
  return entry.serial;
}

function weightsFor(candidate) {
  const { id, geography } = CANDIDATES[candidate.name];
  const listSerial = listSerialOf(candidate.groupId);
  return {
    id,
    weights: source.districts.map((d) =>
      geography === "mayor"
        ? (d.mayor.votes[candidate.serial] ?? 0)
        : (d.assemblyList.votes[listSerial] ?? 0),
    ),
  };
}

function apportion(total, weights) {
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const exact = weights.map((w) => (total * w) / weightSum);
  const floors = exact.map(Math.floor);
  let rest = total - floors.reduce((a, b) => a + b, 0);
  const order = exact
    .map((value, index) => ({ index, remainder: value - floors[index] }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (const { index } of order) {
    if (rest-- <= 0) break;
    floors[index] += 1;
  }
  return floors;
}

const turnout = source.districts.reduce((sum, d) => sum + d.turnout, 0);
const eligible = source.districts.reduce((sum, d) => sum + d.eligible, 0);

const perCandidate = source.mayorBallot
  .map(weightsFor)
  .map(({ id, weights }) => ({
    id,
    votes: apportion(Math.round(START_POLL[id] * turnout), weights),
  }));

const order = Object.keys(START_POLL);
const candidateListData = source.districts.map((d, index) => {
  const partok = Object.fromEntries(
    order.map((id) => [id, perCandidate.find((c) => c.id === id).votes[index]]),
  );
  const decided = Object.values(partok).reduce((a, b) => a + b, 0);
  if (decided > d.eligible) {
    throw new Error(`${d.name}: more decided voters than eligible voters`);
  }
  return {
    megyekod: 1,
    megye: "Budapest",
    oevk: d.district,
    telepules: `${ROMAN[index]}. kerület`,
    valasztopolgar: d.eligible,
    partok,
  };
});

const write = (file, data) =>
  writeFileSync(join(campaignDir, file), `${JSON.stringify(data, null, 2)}\n`);

write("candidate_list_data.json", candidateListData);
write("voter_environment_config.json", {
  eligibleVoters: eligible,
  maxTurnout: MAX_TURNOUT,
});

console.log({ eligible, turnout });
for (const { id, votes } of perCandidate) {
  const total = votes.reduce((a, b) => a + b, 0);
  console.log(id, total, (total / turnout).toFixed(4));
}
