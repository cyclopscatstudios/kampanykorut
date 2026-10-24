import { describe, expect, it } from "vitest";
import { parseCampaignBundle, serializeCampaignBundle, type CampaignBundle } from "./campaignBundle";

const base = (): CampaignBundle => ({
  format: "kampanykorut-campaign-bundle",
  formatVersion: 1,
  campaignId: "test",
  route: "test",
  files: { "manifest.json": { schemaVersion: 1, metadata: { version: "1" }, files: {} } },
  assetPaths: [],
});

describe("campaign bundle boundary", () => {
  it("rejects malformed JSON without returning a staged bundle", () => {
    const result = parseCampaignBundle("{");
    expect(result.bundle).toBeUndefined();
    expect(result.diagnostics[0]?.code).toBe("bundle-invalid-json");
  });

  it("rejects future envelope versions transactionally", () => {
    const result = parseCampaignBundle(JSON.stringify({ ...base(), formatVersion: 2 }));
    expect(result.bundle).toBeUndefined();
    expect(result.diagnostics.some((item) => item.code === "bundle-version")).toBe(true);
  });

  it("rejects paths outside the bundle", () => {
    const bundle = base();
    bundle.files["../escape.json"] = {};
    const result = parseCampaignBundle(JSON.stringify(bundle));
    expect(result.bundle).toBeUndefined();
    expect(result.diagnostics.some((item) => item.code === "bundle-path")).toBe(true);
  });

  it("serializes deterministically with a trailing newline", () => {
    const first = base();
    first.files = { "z.json": { b: 2, a: 1 }, "manifest.json": first.files["manifest.json"] };
    const second = { ...first, files: { "manifest.json": first.files["manifest.json"], "z.json": { a: 1, b: 2 } } };
    expect(serializeCampaignBundle(first)).toBe(serializeCampaignBundle(second));
    expect(serializeCampaignBundle(first).endsWith("\n")).toBe(true);
  });
});
