import { describe, expect, it, vi } from "vitest";

import type { CampaignDraft } from "./CampaignBundleContext";
import { makeStoredDraft, parseStoredDraft } from "./CampaignBundleContext";

const draft = { title: "Teszt", year: "2026" } as CampaignDraft;

describe("Campaign Maker draft storage envelope", () => {
  it("migrates a legacy raw draft without changing its content", () => {
    expect(parseStoredDraft(JSON.stringify(draft))).toEqual({
      storageVersion: 1,
      revision: 0,
      updatedAt: 0,
      draft,
    });
  });

  it("creates monotonically revisioned storage records", () => {
    vi.spyOn(Date, "now").mockReturnValue(1234);
    expect(makeStoredDraft(draft, 7)).toEqual({
      storageVersion: 1,
      revision: 7,
      updatedAt: 1234,
      draft,
    });
  });

  it("rejects corrupt revision metadata rather than silently resetting it", () => {
    expect(() =>
      parseStoredDraft(
        JSON.stringify({
          storageVersion: 1,
          revision: -1,
          updatedAt: 0,
          draft,
        }),
      ),
    ).toThrow("sérült");
  });
});
