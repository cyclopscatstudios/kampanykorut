import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(appDir, "dist");
const ssrDir = path.join(appDir, "dist-ssr");
const origin = process.env.SITE_ORIGIN ?? "https://kampanykorut.hu";

const { window } = new JSDOM("<!doctype html><html><body></body></html>", {
  url: `${origin}/`,
});
for (const key of [
  "window",
  "document",
  "navigator",
  "location",
  "localStorage",
  "sessionStorage",
]) {
  Object.defineProperty(globalThis, key, {
    value: window[key],
    configurable: true,
  });
}

const readJSON = async (file) => JSON.parse(await readFile(file, "utf-8"));

// Campaign data is read from the built static files; when campaigns move to
// campaign-api, only these two loaders need to switch to API calls.
const loadCampaigns = () =>
  readJSON(path.join(distDir, "assets/jsons/game_modes.json"));
const loadElectionConfig = (route) =>
  readJSON(path.join(distDir, "campaigns", route, "election_config.json"));

async function writePage(urlPath, html) {
  const file = path.join(distDir, `${urlPath}.html`);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
}

function sitemapEntry(urlPath, priority) {
  return `  <url>
    <loc>${origin}${urlPath}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const { buildCampaignPageData, campaignPagePath, renderCampaignPage } =
  await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);

const template = await readFile(path.join(distDir, "index.html"), "utf-8");
const campaigns = (await loadCampaigns()).filter((c) => c.isPublished);
const sitemapEntries = [];

for (const campaign of campaigns) {
  const electionConfig = await loadElectionConfig(campaign.route);
  const campaignData = buildCampaignPageData(campaign, electionConfig);
  const pages = [
    campaignData,
    ...campaignData.sides.map((side) => ({ ...campaignData, side })),
  ];
  for (const data of pages) {
    const urlPath = campaignPagePath(campaign.id, data.side?.id);
    await writePage(urlPath, await renderCampaignPage(template, data, origin));
    sitemapEntries.push(sitemapEntry(urlPath, data.side ? "0.7" : "0.8"));
  }
}

const sitemapFile = path.join(distDir, "sitemap.xml");
const sitemap = await readFile(sitemapFile, "utf-8");
await writeFile(
  sitemapFile,
  sitemap.replace("</urlset>", `${sitemapEntries.join("\n")}\n</urlset>`),
);
await rm(ssrDir, { recursive: true, force: true });

console.log(`Prerendered ${sitemapEntries.length} campaign pages`);
