import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { DistrictPoligon } from "../types";

const sharedDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../apps/kampanykorut/public/assets/jsons/shared",
);

const read = (name: string): DistrictPoligon[] =>
  JSON.parse(readFileSync(join(sharedDir, `${name}.json`), "utf8"));

const points = (poligon: string) =>
  poligon.split(",").map((p) => p.trim().split(/\s+/).map(Number));

describe("budapest_districts.json", () => {
  const districts = read("budapest_districts");

  it("has the 23 districts of Budapest keyed as megyekod 1, oevk 1-23", () => {
    expect(districts.map((d) => [d.maz, d.evk])).toEqual(
      Array.from({ length: 23 }, (_, i) => [
        "01",
        String(i + 1).padStart(2, "0"),
      ]),
    );
  });

  it("has closed polygons of valid coordinates inside Budapest", () => {
    for (const district of districts) {
      const ring = points(district.poligon);
      expect(ring.length).toBeGreaterThan(3);
      expect(ring[0]).toEqual(ring[ring.length - 1]);
      for (const [lat, lon] of ring) {
        expect(lat).toBeGreaterThan(47.3);
        expect(lat).toBeLessThan(47.7);
        expect(lon).toBeGreaterThan(18.9);
        expect(lon).toBeLessThan(19.4);
      }
      const [lat, lon] = district.centrum.split(" ").map(Number);
      expect(Number.isFinite(lat) && Number.isFinite(lon)).toBe(true);
    }
  });
});
