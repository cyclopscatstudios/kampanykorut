import { describe, expect, it } from "vitest";
import { parseEffectInput } from "./narrativeEffect";

describe("narrative effect input", () => {
  it("does not coerce a cleared non-zero effect to zero", () => {
    expect(parseEffectInput("")).toBeNull();
    expect(parseEffectInput("   ")).toBeNull();
  });

  it("accepts bounded explicit numbers and rejects invalid values", () => {
    expect(parseEffectInput("-2.5")).toBe(-2.5);
    expect(parseEffectInput("0")).toBe(0);
    expect(parseEffectInput("11")).toBeNull();
    expect(parseEffectInput("not-a-number")).toBeNull();
  });
});
