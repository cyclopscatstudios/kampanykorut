import { describe, expect, it, vi } from "vitest";

import type { CampaignDraft } from "./CampaignBundleContext";
import {
  makeStoredDraft,
  parseStoredDraft,
  persistDraft,
} from "./CampaignBundleContext";

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

  it("reports quota or permission denial without advancing the revision", () => {
    const storage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn().mockImplementation(() => {
        throw new DOMException("denied", "QuotaExceededError");
      }),
    };
    expect(persistDraft(storage, "draft", draft, 4)).toEqual({
      status: "failed",
    });
    expect(storage.setItem).toHaveBeenCalledOnce();
  });

  it("reports read denial and serialization failure without mutating storage", () => {
    const denied = {
      getItem: vi.fn().mockImplementation(() => {
        throw new DOMException("denied", "SecurityError");
      }),
      setItem: vi.fn(),
    };
    expect(persistDraft(denied, "draft", draft, 1)).toEqual({
      status: "failed",
    });
    expect(denied.setItem).not.toHaveBeenCalled();

    const circular = { ...draft } as CampaignDraft;
    circular.bundle = circular as unknown as CampaignDraft["bundle"];
    const storage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    };
    expect(persistDraft(storage, "draft", circular, 1)).toEqual({
      status: "failed",
    });
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("stops a stale tab before writing over a newer revision", () => {
    const storage = {
      getItem: vi
        .fn()
        .mockReturnValue(JSON.stringify(makeStoredDraft(draft, 8))),
      setItem: vi.fn(),
    };
    expect(persistDraft(storage, "draft", draft, 7)).toEqual({
      status: "conflict",
    });
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
