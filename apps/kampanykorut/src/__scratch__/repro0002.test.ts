import "reflect-metadata";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { it, vi } from "vitest";
import { createCampaignEngine } from "@/logic/application/createCampaignEngine";
import { loadCampaignConfig } from "@/logic/application/loadCampaignConfig";

const PUBLIC = resolve(__dirname, "../../public");

it("loads and starts _0002_", async () => {
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const p = resolve(PUBLIC, "." + String(input).split("?")[0]);
    if (!existsSync(p)) return new Response("nf", { status: 404 });
    return new Response(readFileSync(p, "utf-8"), { status: 200 });
  });
  const config = await loadCampaignConfig("0002_test_mayoral");
  for (const side of ["lmp", "dk_mszp_parbeszed"]) {
    const cand = Object.keys(config.playableSides![side])[0];
    const engine = createCampaignEngine(config, "0002_test_mayoral", side, cand);
    console.log(side, cand, Object.keys(engine));
  }
});
