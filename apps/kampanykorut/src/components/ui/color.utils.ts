import {
  backgroundColors,
  type Colors,
} from "../../../../../shared/types/color";

export function getPartyColor(
  partyColor: string,
  diff: number,
  isGameEnded?: boolean,
): string {
  if (isGameEnded) {
    return partyColor;
  }

  return getShadedColor(partyColor, diff);
}

export function getPartyHoverColor(color: string, diff: number): string {
  const shadedColor = getShadedColor(color, diff);
  return adjustLightness(shadedColor, 0.25);
}

export function getPartyActiveColor(color: string, diff: number): string {
  const shadedColor = getShadedColor(color, diff);
  return adjustLightness(shadedColor, -0.45);
}

export function adjustLightness(baseHex: string, factor: number): string {
  const { h, s, l } = hexToHsl(baseHex);

  const newL = factor >= 0 ? l + (100 - l) * factor : l * (1 + factor);

  return hslToHex(h, s, Math.max(0, Math.min(100, newL)));
}

function hexToHsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);

  const f = (n: number) =>
    Math.round(
      255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))),
    );

  return (
    "#" +
    [f(0), f(8), f(4)].map((x) => x.toString(16).padStart(2, "0")).join("")
  );
}

function getShadedColor(baseHex: string, percent: number): string {
  const { h, s } = hexToHsl(baseHex);

  if (percent < 3.5) {
    return "#cccccc";
  }

  if (percent < 5) {
    return hslToHex(h, s * 0.3, 85);
  }

  if (percent < 10) {
    return hslToHex(h, s * 0.5, 70);
  }

  if (percent < 15) {
    return hslToHex(h, s * 0.85, 55);
  }

  if (percent < 20) {
    return hslToHex(h, s * 0.95, 45);
  }

  return baseHex;
}

export function getBaseBackgroundColor(color?: Colors) {
  if (!color) {
    return "bg-gray-500";
  }
  return backgroundColors[color];
}
