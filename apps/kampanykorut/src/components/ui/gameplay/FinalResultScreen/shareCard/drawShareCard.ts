import {
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
  type ShareCardData,
} from "./shareCard.utils";

const W = SHARE_CARD_WIDTH;
const H = SHARE_CARD_HEIGHT;
const PAD = 56;
const BG = "#0a1224";
const FONT = "Montserrat, system-ui, sans-serif";
const CTA_H = 96;
const IMAGE_TIMEOUT_MS = 8000;

export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  await loadFonts();
  const [hero, logo] = await Promise.all([
    data.imageUri ? loadImage(data.imageUri).catch(() => null) : null,
    loadImage("/favicon.svg").catch(() => null),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not available");
  }

  drawBackground(ctx, hero);
  drawHeader(ctx, data, logo);
  drawHeadline(ctx, data);
  drawStats(ctx, data);
  drawCta(ctx, data);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Canvas export failed")),
      "image/png",
    ),
  );
}

async function loadFonts() {
  if (!document.fonts) return;
  const sample = "Kampánykörút őű ŐŰ 0123456789";
  await Promise.all(
    ["500", "600", "700"].map((weight) =>
      document.fonts.load(`${weight} 20px Montserrat`, sample).catch(() => []),
    ),
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      img.onload = img.onerror = null;
      img.src = "";
      reject(new Error(`Image load timed out: ${src}`));
    }, IMAGE_TIMEOUT_MS);
    img.crossOrigin = "anonymous";
    img.onload = () => {
      clearTimeout(timeout);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Image failed to load: ${src}`));
    };
    img.src = src;
  });
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  hero: HTMLImageElement | null,
) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  const heroX = 420;
  const heroH = H - CTA_H;
  if (hero) {
    drawCover(ctx, hero, heroX, 0, W - heroX, heroH);
  }

  const side = ctx.createLinearGradient(heroX, 0, heroX + 380, 0);
  side.addColorStop(0, BG);
  side.addColorStop(0.55, "rgba(10,18,36,0.7)");
  side.addColorStop(1, "rgba(10,18,36,0.1)");
  ctx.fillStyle = side;
  ctx.fillRect(heroX, 0, W - heroX, heroH);

  const vertical = ctx.createLinearGradient(0, 0, 0, heroH);
  vertical.addColorStop(0, "rgba(10,18,36,0.55)");
  vertical.addColorStop(0.25, "rgba(10,18,36,0)");
  vertical.addColorStop(0.55, "rgba(10,18,36,0.2)");
  vertical.addColorStop(1, BG);
  ctx.fillStyle = vertical;
  ctx.fillRect(heroX, 0, W - heroX, heroH);
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) * 0.3;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  data: ShareCardData,
  logo: HTMLImageElement | null,
) {
  const top = 36;
  if (logo) {
    ctx.drawImage(logo, PAD, top, 48, 48);
  }
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 26px ${FONT}`;
  ctx.fillStyle = "#f1f5f9";
  ctx.fillText("Kampány", PAD + 62, top + 28);
  const kw = ctx.measureText("Kampány").width;
  ctx.fillStyle = "#4f7be8";
  ctx.fillText("körút", PAD + 62 + kw, top + 28);
  ctx.font = `700 9px ${FONT}`;
  ctx.fillStyle = "#cbd5e1";
  drawSpaced(ctx, "POLITIKAI STRATÉGIA JÁTÉK", PAD + 63, top + 44, 2.2);

  ctx.font = `700 15px ${FONT}`;
  const line1 = fit(ctx, data.campaignLabel, 360);
  const w1 = ctx.measureText(line1).width;
  ctx.font = `600 11px ${FONT}`;
  const w2 = ctx.measureText(data.electionLabel).width;
  const chipW = Math.max(w1, w2) + 58;
  const chipH = 48;
  const chipX = W - PAD - chipW;
  const chipY = top;
  roundRect(ctx, chipX, chipY, chipW, chipH, chipH / 2);
  ctx.fillStyle = "rgba(10,18,36,0.72)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(chipX + 24, chipY + chipH / 2, 10, 0, Math.PI * 2);
  ctx.fillStyle = data.partyColor;
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 15px ${FONT}`;
  ctx.fillText(line1, chipX + 44, chipY + 22);
  ctx.fillStyle = "#cbd5e1";
  ctx.font = `600 11px ${FONT}`;
  ctx.fillText(data.electionLabel, chipX + 44, chipY + 38);
}

function drawHeadline(ctx: CanvasRenderingContext2D, data: ShareCardData) {
  const maxW = 640;
  let y = 128;

  ctx.font = `700 12px ${FONT}`;
  const kicker = data.kicker.toUpperCase();
  const kw = measureSpaced(ctx, kicker, 2.4) + 24;
  roundRect(ctx, PAD, y, kw, 28, 6);
  ctx.fillStyle = data.accent;
  ctx.fill();
  ctx.fillStyle = readableOn(data.accent);
  drawSpaced(ctx, kicker, PAD + 12, y + 19, 2.4);

  y += 44;
  let size = 60;
  let lines: string[] = [];
  while (size >= 36) {
    ctx.font = `700 ${size}px ${FONT}`;
    lines = wrap(ctx, data.title, maxW);
    if (lines.length <= 2) break;
    size -= 4;
  }
  if (lines.length > 2) {
    lines = [lines[0], lines.slice(1).join(" ")];
  }
  ctx.fillStyle = "#f1f5f9";
  const lineH = size * 1.02;
  lines.forEach((line, i) => {
    ctx.fillText(fit(ctx, line, maxW), PAD - 2, y + size * 0.85 + i * lineH);
  });

  const candY = 330;
  ctx.beginPath();
  ctx.arc(PAD + 8, candY + 24, 8, 0, Math.PI * 2);
  ctx.fillStyle = data.partyColor;
  ctx.fill();
  ctx.font = `700 10px ${FONT}`;
  ctx.fillStyle = "#94a3b8";
  drawSpaced(ctx, data.playerLabel.toUpperCase(), PAD + 28, candY + 8, 1.8);
  ctx.font = `700 24px ${FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(fit(ctx, data.candidateName, 560), PAD + 28, candY + 34);
  if (data.partyName && data.partyName !== data.candidateName) {
    ctx.font = `600 14px ${FONT}`;
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(fit(ctx, data.partyName, 560), PAD + 28, candY + 54);
  }
}

function drawStats(ctx: CanvasRenderingContext2D, data: ShareCardData) {
  const y = 408;
  const h = 104;
  const gap = 14;
  const mainW = 470;
  const restW = (W - PAD * 2 - mainW - gap * 2) / 2;

  tile(ctx, PAD, y, mainW, h, true);
  const chartW = 170;
  if (data.seats) {
    drawHemicycle(ctx, data.seats, PAD + 18, y + 14, chartW, h - 28);
  } else if (data.bars) {
    drawBars(ctx, data.bars, PAD + 20, y + 22, chartW - 10, h - 44);
  }
  const textX = PAD + chartW + 36;
  label(ctx, data.metricLabel, textX, y + 30);
  ctx.font = `700 46px ${FONT}`;
  ctx.fillStyle = data.partyColor;
  ctx.fillText(data.metricValue, textX, y + 80);
  if (data.metricSuffix) {
    const vw = ctx.measureText(data.metricValue).width;
    ctx.font = `700 20px ${FONT}`;
    ctx.fillStyle = "#64748b";
    ctx.fillText(data.metricSuffix, textX + vw + 8, y + 80);
  }

  const x2 = PAD + mainW + gap;
  tile(ctx, x2, y, restW, h);
  label(ctx, data.winnerLabel, x2 + 20, y + 30);
  roundRect(ctx, x2 + 20, y + 50, 30, 30, 8);
  ctx.fillStyle = data.winnerColor;
  ctx.fill();
  drawTrophy(ctx, x2 + 35, y + 65, readableOn(data.winnerColor));
  ctx.font = `700 17px ${FONT}`;
  ctx.fillStyle = "#ffffff";
  const winnerLines = wrap(ctx, data.winnerValue, restW - 82).slice(0, 2);
  winnerLines.forEach((line, i) =>
    ctx.fillText(
      fit(ctx, line, restW - 82),
      x2 + 62,
      y + (winnerLines.length === 1 ? 71 : 62) + i * 21,
    ),
  );

  const x3 = x2 + restW + gap;
  tile(ctx, x3, y, restW, h);
  label(ctx, data.turnsLabel, x3 + 20, y + 30);
  ctx.font = `700 46px ${FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(String(data.turns), x3 + 20, y + 80);
}

function drawCta(ctx: CanvasRenderingContext2D, data: ShareCardData) {
  const y = H - CTA_H;
  const g = ctx.createLinearGradient(0, y, W, H);
  g.addColorStop(0, "#2952c8");
  g.addColorStop(0.55, "#3b65d4");
  g.addColorStop(1, "#4f7be8");
  ctx.fillStyle = g;
  ctx.fillRect(0, y, W, CTA_H);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, y, W, CTA_H);
  ctx.clip();
  ctx.beginPath();
  ctx.arc(W - 120, y - 30, 150, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 36;
  ctx.stroke();
  ctx.restore();

  ctx.font = `600 15px ${FONT}`;
  ctx.fillStyle = "#dbe4ff";
  ctx.fillText(fit(ctx, data.cta, 700), PAD, y + 36);
  ctx.font = `700 34px ${FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(data.displayUrl, PAD, y + 74);

  ctx.font = `700 17px ${FONT}`;
  const bw = ctx.measureText(data.ctaButton).width + 48;
  const bh = 52;
  const bx = W - PAD - bw;
  const by = y + (CTA_H - bh) / 2;
  roundRect(ctx, bx, by, bw, bh, 12);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.fillStyle = "#1e3fa6";
  ctx.fillText(data.ctaButton, bx + 24, by + 33);
}

function tile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  strong = false,
) {
  roundRect(ctx, x, y, w, h, 16);
  if (strong) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, "#14203d");
    g.addColorStop(1, "#0f1a33");
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = "rgba(20,32,61,0.88)";
  }
  ctx.fill();
  ctx.strokeStyle = "rgba(148,163,184,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
) {
  ctx.font = `700 11px ${FONT}`;
  ctx.fillStyle = "#94a3b8";
  drawSpaced(ctx, text.toUpperCase(), x, y, 1.6);
}

function drawHemicycle(
  ctx: CanvasRenderingContext2D,
  seats: { color: string; seats: number }[],
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const total = seats.reduce((sum, s) => sum + s.seats, 0);
  if (!total) return;
  const outer = Math.min(w / 2, h);
  const cx = x + w / 2;
  const cy = y + outer;
  const rows = total > 250 ? 9 : total > 120 ? 7 : 5;
  const inner = outer * 0.38;
  const radii = Array.from(
    { length: rows },
    (_, i) => inner + ((outer - inner) * (i + 0.5)) / rows,
  );
  const radiusSum = radii.reduce((a, b) => a + b, 0);
  const points: { a: number; x: number; y: number }[] = [];
  let left = total;
  radii.forEach((r, i) => {
    const n = i === rows - 1 ? left : Math.round((total * r) / radiusSum);
    left -= n;
    for (let j = 0; j < n; j++) {
      const a = Math.PI - (Math.PI * j) / Math.max(1, n - 1);
      points.push({ a, x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) });
    }
  });
  points.sort((p, q) => q.a - p.a);
  const colors = seats.flatMap((s) => Array<string>(s.seats).fill(s.color));
  const dot = Math.max(1.2, ((outer - inner) / rows) * 0.36);
  points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, dot, 0, Math.PI * 2);
    ctx.fillStyle = colors[i] ?? "#334155";
    ctx.fill();
  });
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.setLineDash([2, 3]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outer - 2);
  ctx.lineTo(cx, cy - inner + 6);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  bars: { color: string; share: number }[],
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const top = Math.max(...bars.map((b) => b.share), 0.0001);
  const barH = 10;
  const gap = (h - barH * bars.length) / Math.max(1, bars.length - 1);
  bars.forEach((bar, i) => {
    const by = y + i * (barH + gap);
    roundRect(ctx, x, by, w, barH, barH / 2);
    ctx.fillStyle = "rgba(51,65,85,0.6)";
    ctx.fill();
    roundRect(
      ctx,
      x,
      by,
      Math.max(barH, (bar.share / top) * w),
      barH,
      barH / 2,
    );
    ctx.fillStyle = bar.color;
    ctx.fill();
  });
}

function drawTrophy(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  color: string,
) {
  ctx.save();
  ctx.translate(cx - 9, cy - 9);
  ctx.scale(0.75, 0.75);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke(new Path2D("M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"));
  ctx.stroke(new Path2D("M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"));
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function measureSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  spacing: number,
) {
  return ctx.measureText(text).width + spacing * Math.max(0, text.length - 1);
}

function drawSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
) {
  let cursor = x;
  for (const char of text) {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + spacing;
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxW) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  if (ctx.measureText(text).width <= maxW) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxW) {
    cut = cut.slice(0, -1);
  }
  return `${cut.trimEnd()}…`;
}

export function readableOn(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#0a1224";
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.3 ? "#0a1224" : "#ffffff";
}
