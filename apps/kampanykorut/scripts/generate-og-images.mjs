import { createReadStream, existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { chromium } from "playwright";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(appDir, "public");
const ssrDir = path.join(appDir, "dist-ssr");
const logoFile = path.resolve(
  appDir,
  "../../brand-assets/svg/logo-horizontal-dark.svg",
);
const only = process.argv[2];

const { window } = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://kampanykorut.hu/",
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

const { buildCampaignPageData, campaignBannerPath, ogImagePath } = await import(
  pathToFileURL(path.join(ssrDir, "entry-server.js")).href
);

const readJSON = async (file) => JSON.parse(await readFile(file, "utf-8"));
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"]/g,
    (c) => `&${{ "&": "amp", "<": "lt", ">": "gt", '"': "quot" }[c]};`,
  );

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};
const server = createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" }).end("<!doctype html>");
    return;
  }
  const file = url === "/__logo.svg" ? logoFile : path.join(publicDir, url);
  if (!file.startsWith(publicDir) && file !== logoFile) {
    res.writeHead(404).end();
    return;
  }
  res.setHeader(
    "Content-Type",
    MIME[path.extname(file)] ?? "application/octet-stream",
  );
  createReadStream(file)
    .on("error", () => res.writeHead(404).end())
    .pipe(res);
});
await new Promise((resolve) => server.listen(0, resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;

function cardHtml({ campaign, side }) {
  const portrait = side?.portrait
    ? `<div class="portrait"><img src="${side.portrait}" alt="" />${
        side.partyLogo
          ? `<img class="badge" src="${side.partyLogo}" alt="" />`
          : ""
      }</div>`
    : "";
  const title = side
    ? `<div class="eyebrow">${escapeHtml(campaign.label)}</div>
       <h1>${escapeHtml(side.candidate.label)}</h1>
       <div class="party">${escapeHtml(side.label)}</div>`
    : `<h1>${escapeHtml(campaign.label)}</h1>`;
  return `<!doctype html><html lang="hu"><head><meta charset="utf-8" /><style>
    @font-face { font-family: Montserrat; font-weight: 300 800; src: url(/fonts/montserrat-latin-ext.woff2) format("woff2"); unicode-range: U+0100-024F; }
    @font-face { font-family: Montserrat; font-weight: 300 800; src: url(/fonts/montserrat-latin.woff2) format("woff2"); }
    * { box-sizing: border-box; margin: 0; }
    body { width: 1200px; height: 630px; overflow: hidden; font-family: Montserrat, sans-serif; color: #fff; background: #0f172a; }
    .bg { position: absolute; inset: 0; background: url("${campaignBannerPath(campaign)}") center / cover; }
    .shade { position: absolute; inset: 0; background: linear-gradient(90deg, #0f172a 0%, rgba(15,23,42,.88) 45%, rgba(15,23,42,.35) 100%), linear-gradient(0deg, rgba(15,23,42,.9) 0%, transparent 45%); }
    .content { position: absolute; inset: 0; padding: 56px 64px; display: flex; flex-direction: column; justify-content: space-between; }
    .logo { height: 44px; width: auto; align-self: flex-start; }
    .text { max-width: ${side?.portrait ? 680 : 900}px; display: flex; flex-direction: column; gap: 16px; }
    h1 { font-size: ${side ? 68 : 76}px; font-weight: 800; line-height: 1.05; letter-spacing: -1px; }
    .eyebrow { font-size: 26px; font-weight: 600; color: #93c5fd; }
    .party { font-size: 30px; font-weight: 600; color: #dbeafe; }
    .footer { display: flex; align-items: center; gap: 16px; font-size: 24px; font-weight: 600; color: #cbd5e1; }
    .cta { padding: 10px 22px; border-radius: 10px; background: #2563eb; color: #fff; }
    .portrait { position: absolute; right: 80px; top: 50%; transform: translateY(-50%); width: 340px; height: 340px; }
    .portrait > img:first-child { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 6px solid rgba(96,165,250,.85); box-shadow: 0 20px 60px rgba(0,0,0,.5); background: #1e293b; }
    .badge { position: absolute; right: 0; bottom: 8px; width: 104px; height: 104px; object-fit: contain; padding: 8px; border-radius: 20px; background: #0f172a; border: 3px solid rgba(255,255,255,.25); }
  </style></head><body>
    <div class="bg"></div><div class="shade"></div>
    ${portrait}
    <div class="content">
      <img class="logo" src="/__logo.svg" alt="" />
      <div class="text">${title}</div>
      <div class="footer"><span class="cta">Kampány indítása</span><span>kampanykorut.hu</span></div>
    </div>
  </body></html>`;
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

const campaignsDir = path.join(publicDir, "campaigns");
const campaigns = [];
for (const dirent of await readdir(campaignsDir, { withFileTypes: true })) {
  const manifestPath = path.join(campaignsDir, dirent.name, "manifest.json");
  if (!dirent.isDirectory() || !existsSync(manifestPath)) continue;
  const { listing } = await readJSON(manifestPath);
  if (listing?.status === "published" && (!only || listing.id === only)) {
    campaigns.push({ ...listing, route: dirent.name });
  }
}
let count = 0;
for (const campaign of campaigns) {
  const electionConfig = await readJSON(
    path.join(publicDir, "campaigns", campaign.route, "election_config.json"),
  );
  const base = buildCampaignPageData(campaign, electionConfig);
  for (const data of [base, ...base.sides.map((side) => ({ ...base, side }))]) {
    await page.goto(`${baseUrl}/`);
    await page.setContent(cardHtml(data), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const out = path.join(publicDir, ogImagePath(campaign.id, data.side?.id));
    await mkdir(path.dirname(out), { recursive: true });
    await page.screenshot({ path: out, type: "jpeg", quality: 85 });
    count++;
  }
}

await browser.close();
server.close();
await rm(ssrDir, { recursive: true, force: true });
console.log(`Generated ${count} OG images`);
