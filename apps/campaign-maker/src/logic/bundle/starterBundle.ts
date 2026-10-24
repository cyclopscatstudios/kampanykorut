import type { CampaignBundle } from "./campaignBundle";

const STARTER_ROUTE = "2026_tavaszi-szel";
const FILES = [
  "manifest.json",
  "election_config.json",
  "voter_environment_config.json",
  "oevk_constituency_results.json",
  "end_results.json",
  "custom_pollsters.json",
  "tisza/magyar_peter/2026_tisza_questions.json",
  "tisza/magyar_peter/2026_tisza_answer_effects.json",
  "tisza/magyar_peter/2026_tisza_advisor_feedback.json",
  "tisza/magyar_peter/advisor_feedback_assets.json",
  "tisza/magyar_peter/end_results.json",
] as const;

function collectAssets(value: unknown, assets: Set<string>) {
  if (typeof value === "string" && value.startsWith("/images/")) assets.add(value);
  else if (Array.isArray(value)) value.forEach((item) => collectAssets(item, assets));
  else if (typeof value === "object" && value !== null) Object.values(value).forEach((item) => collectAssets(item, assets));
}

export async function loadStarterBundle(): Promise<CampaignBundle> {
  const files: Record<string, unknown> = {};
  const base = `${import.meta.env.BASE_URL}campaigns/${STARTER_ROUTE}`;
  await Promise.all(FILES.map(async (path) => {
    const response = await fetch(`${base}/${path}`);
    if (!response.ok) throw new Error(`A kezdősablon nem tölthető be: ${path}`);
    files[path] = (await response.json()) as unknown;
  }));
  const assets = new Set<string>();
  Object.values(files).forEach((value) => collectAssets(value, assets));
  return {
    format: "kampanykorut-campaign-bundle",
    formatVersion: 1,
    campaignId: `local-${crypto.randomUUID()}`,
    route: `local-${crypto.randomUUID()}`,
    files,
    assetPaths: [...assets].sort(),
  };
}
