import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import MarkdownIt from "markdown-it";
import { chromium } from "playwright";

const legalDir = dirname(fileURLToPath(import.meta.url));
const appDir = join(legalDir, "..");
const fontUrl = (file) =>
  pathToFileURL(join(appDir, "public/fonts", file)).href;

const styles = `
@font-face { font-family: Montserrat; font-weight: 300 700; src: url("${fontUrl("montserrat-latin.woff2")}") format("woff2"); unicode-range: U+0000-00FF, U+2000-206F, U+20AC; }
@font-face { font-family: Montserrat; font-weight: 300 700; src: url("${fontUrl("montserrat-latin-ext.woff2")}") format("woff2"); unicode-range: U+0100-02BA, U+1E00-1EFF; }
@page { size: A4; margin: 18mm 18mm 20mm; }
body { font-family: Montserrat, sans-serif; font-size: 10pt; line-height: 1.55; color: #1e293b; }
h1 { font-size: 20pt; color: #0f172a; margin: 0 0 2mm; }
h1 + p em { color: #64748b; font-style: normal; font-size: 9pt; }
h2 { font-size: 13pt; color: #1d4ed8; margin: 7mm 0 2mm; break-after: avoid; }
h3 { font-size: 11pt; color: #0f172a; margin: 5mm 0 1.5mm; break-after: avoid; }
p, li { margin: 0 0 2mm; }
ul { padding-left: 5mm; }
strong { color: #0f172a; }
table { width: 100%; border-collapse: collapse; margin: 2mm 0 4mm; font-size: 9pt; break-inside: avoid; }
th, td { border: 1px solid #cbd5e1; padding: 1.5mm 2mm; text-align: left; vertical-align: top; }
th { background: #f1f5f9; }
a { color: #1d4ed8; }
`;

const markdown = new MarkdownIt({ linkify: true });

const browser = await chromium.launch();
try {
  for (const lang of ["hu", "en"]) {
    const source = readFileSync(join(legalDir, `privacy_${lang}.md`), "utf8");
    const page = await browser.newPage();
    await page.setContent(
      `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${styles}</style></head><body>${markdown.render(source)}</body></html>`,
      { waitUntil: "load" },
    );
    await page.evaluate(() => document.fonts.ready);
    const output = join(appDir, `src/assets/kampanykorut_privacy_${lang}.pdf`);
    await page.pdf({
      path: output,
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `<div style="width:100%;font-size:8pt;color:#94a3b8;text-align:center;font-family:sans-serif">Kampánykörút · <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
    });
    await page.close();
    console.log(`written ${output}`);
  }
} finally {
  await browser.close();
}
