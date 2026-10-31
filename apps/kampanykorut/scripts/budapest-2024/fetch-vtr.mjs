import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE =
  "https://vtr.valasztas.hu/onk2024/data/08021106/szavossz/01/SzeredmTelep-01-";
const MAYOR = "2";
const ASSEMBLY_LIST = "F";

const out = join(
  dirname(fileURLToPath(import.meta.url)),
  "vtr-onk2024-budapest.json",
);

function votesBySerial(result) {
  return Object.fromEntries(
    result.tetelek.map((t) => [t.szavlap_sorsz, t.szavazat]),
  );
}

function ballot(data, type) {
  return data.szavazolapok.find((s) => s.valaltip === type).jeloltek;
}

const districts = [];
let mayorBallot;
let listBallot;

for (let i = 1; i <= 23; i++) {
  const taz = String(i).padStart(3, "0");
  const url = `${BASE}${taz}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url}: HTTP ${response.status}`);
  }
  const { data } = await response.json();
  const results = Object.fromEntries(
    data.eredmenyek.map((e) => [e.valaltip, e]),
  );
  const mayor = results[MAYOR];
  const list = results[ASSEMBLY_LIST];

  const mayorVotes = votesBySerial(mayor);
  const listVotes = votesBySerial(list);
  const sum = (votes) => Object.values(votes).reduce((a, b) => a + b, 0);
  if (sum(mayorVotes) !== mayor.szl_ervenyes) {
    throw new Error(`${taz}: mayoral votes do not add up`);
  }
  if (sum(listVotes) !== list.szl_ervenyes) {
    throw new Error(`${taz}: assembly list votes do not add up`);
  }

  const mayorSerials = ballot(data, MAYOR).map((j) => ({
    serial: j.szavlap_sorsz,
    name: j.jelolt_neve,
    groupId: j.jlcs_id,
  }));
  const listSerials = ballot(data, ASSEMBLY_LIST).map((j) => ({
    serial: j.szavlap_sorsz,
    groupId: j.jlcs_id,
  }));
  mayorBallot ??= mayorSerials;
  listBallot ??= listSerials;
  if (
    JSON.stringify(mayorBallot) !== JSON.stringify(mayorSerials) ||
    JSON.stringify(listBallot) !== JSON.stringify(listSerials)
  ) {
    throw new Error(`${taz}: ballot order differs from district 001`);
  }

  districts.push({
    district: i,
    name: data.telnev,
    eligible: mayor.vp_osszes,
    turnout: mayor.vp_megjelent,
    mayor: {
      valid: mayor.szl_ervenyes,
      invalid: mayor.szl_ervenytelen,
      votes: mayorVotes,
    },
    assemblyList: { valid: list.szl_ervenyes, votes: listVotes },
  });
}

writeFileSync(
  out,
  `${JSON.stringify(
    {
      source: `${BASE}{001..023}.json`,
      fetchedAt: new Date().toISOString().slice(0, 10),
      mayorBallot,
      assemblyListBallot: listBallot,
      districts,
    },
    null,
    2,
  )}\n`,
);
console.log(`wrote ${districts.length} districts to ${out}`);
