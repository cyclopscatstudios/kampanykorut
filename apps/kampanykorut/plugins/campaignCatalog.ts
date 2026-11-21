import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import type {
  CampaignListing,
  CampaignStatus,
} from "../../../shared/types/configs/campaign-manifest";

const CAMPAIGN_STATUSES: CampaignStatus[] = ["draft", "candidate", "published"];

export type CampaignCatalogEntry = CampaignListing & { route: string };

export const CAMPAIGN_CATALOG_PATH = "assets/jsons/campaigns.json";

const REQUIRED_STRINGS = [
  "id",
  "label",
  "description",
  "campaignBanner",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseListing(route: string, listing: unknown): CampaignCatalogEntry {
  const fail = (message: string): never => {
    throw new Error(`[campaign-catalog] ${route}/manifest.json: ${message}`);
  };

  if (!isRecord(listing)) {
    return fail("listing must be an object");
  }
  for (const key of REQUIRED_STRINGS) {
    if (typeof listing[key] !== "string" || listing[key] === "") {
      fail(`listing.${key} must be a non-empty string`);
    }
  }
  if (!Number.isInteger(listing.year)) {
    fail("listing.year must be an integer");
  }
  if (
    !Array.isArray(listing.tags) ||
    !listing.tags.every((tag) => typeof tag === "string")
  ) {
    fail("listing.tags must be an array of strings");
  }
  if (
    listing.thinCampaignBanner !== undefined &&
    typeof listing.thinCampaignBanner !== "string"
  ) {
    fail("listing.thinCampaignBanner must be a string");
  }
  if (!CAMPAIGN_STATUSES.includes(listing.status as CampaignStatus)) {
    fail(`listing.status must be one of ${CAMPAIGN_STATUSES.join(", ")}`);
  }

  return {
    id: listing.id as string,
    label: listing.label as string,
    description: listing.description as string,
    year: listing.year as number,
    tags: listing.tags as string[],
    route,
    campaignBanner: listing.campaignBanner as string,
    ...(listing.thinCampaignBanner
      ? { thinCampaignBanner: listing.thinCampaignBanner as string }
      : {}),
    status: listing.status as CampaignStatus,
  };
}

export function buildCampaignCatalog(
  campaignsDir: string,
): CampaignCatalogEntry[] {
  const entries: CampaignCatalogEntry[] = [];

  for (const dirent of readdirSync(campaignsDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;
    const manifestPath = path.join(campaignsDir, dirent.name, "manifest.json");
    if (!existsSync(manifestPath)) continue;

    const manifest: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (!isRecord(manifest) || manifest.listing === undefined) continue;

    entries.push(parseListing(dirent.name, manifest.listing));
  }

  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.id)) {
      throw new Error(`[campaign-catalog] duplicate campaign id: ${entry.id}`);
    }
    seen.add(entry.id);
  }

  return entries.sort((a, b) => b.year - a.year || a.id.localeCompare(b.id));
}

export function campaignCatalogPlugin(publicDir: string): Plugin {
  const campaignsDir = path.join(publicDir, "campaigns");
  const serialize = () =>
    JSON.stringify(buildCampaignCatalog(campaignsDir), null, 2);

  return {
    name: "campaign-catalog",
    configureServer(server) {
      server.middlewares.use(`/${CAMPAIGN_CATALOG_PATH}`, (_req, res, next) => {
        try {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(serialize());
        } catch (error) {
          next(error);
        }
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: CAMPAIGN_CATALOG_PATH,
        source: serialize(),
      });
    },
  };
}
