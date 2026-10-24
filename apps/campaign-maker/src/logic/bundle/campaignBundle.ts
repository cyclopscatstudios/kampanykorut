import {
  type CampaignSource,
  type Diagnostic,
  validateCampaign,
} from "@/shared/validation/campaignValidator";

export const BUNDLE_FORMAT = "kampanykorut-campaign-bundle";
export const BUNDLE_FORMAT_VERSION = 1;
export const MAX_BUNDLE_BYTES = 2 * 1024 * 1024;
export const MAX_FILES = 64;
export const MAX_FILE_BYTES = 512 * 1024;

export interface CampaignBundle {
  format: typeof BUNDLE_FORMAT;
  formatVersion: typeof BUNDLE_FORMAT_VERSION;
  campaignId: string;
  route: string;
  files: Record<string, unknown>;
  assetPaths: string[];
}

export interface BundleValidationResult {
  bundle?: CampaignBundle;
  diagnostics: Diagnostic[];
}

const SAFE_ID = /^[a-z0-9_-]{1,64}$/;
const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function diagnostic(code: string, path: string, message: string): Diagnostic {
  return { severity: "error", code, file: "bundle.json", path, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafePath(path: string) {
  const segments = path.split("/");
  return (
    path.length > 0 &&
    path.length <= 180 &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    !/^[a-zA-Z]:/.test(path) &&
    segments.every(
      (segment) => segment.length > 0 && segment !== "." && segment !== "..",
    )
  );
}

function checkJsonValue(
  value: unknown,
  path: string,
  diagnostics: Diagnostic[],
  depth = 0,
) {
  if (depth > 30) {
    diagnostics.push(diagnostic("bundle-depth", path, "A JSON nesting depth exceeds 30."));
    return;
  }
  if (typeof value === "number" && !Number.isFinite(value)) {
    diagnostics.push(diagnostic("bundle-number", path, "Numbers must be finite."));
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      checkJsonValue(item, `${path}/${index}`, diagnostics, depth + 1),
    );
  } else if (isRecord(value)) {
    Object.entries(value).forEach(([key, item]) => {
      if (FORBIDDEN_KEYS.has(key)) {
        diagnostics.push(diagnostic("bundle-key", `${path}/${key}`, "This object key is not permitted."));
      }
      checkJsonValue(item, `${path}/${key}`, diagnostics, depth + 1);
    });
  }
}

export function parseCampaignBundle(text: string): BundleValidationResult {
  const diagnostics: Diagnostic[] = [];
  if (new Blob([text]).size > MAX_BUNDLE_BYTES) {
    return { diagnostics: [diagnostic("bundle-too-large", "", "The bundle is larger than 2 MiB.")] };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch (error) {
    return {
      diagnostics: [diagnostic("bundle-invalid-json", "", error instanceof Error ? error.message : "The file is not valid JSON.")],
    };
  }
  if (!isRecord(parsed)) {
    return { diagnostics: [diagnostic("bundle-root", "", "The bundle root must be an object.")] };
  }
  if (parsed.format !== BUNDLE_FORMAT) diagnostics.push(diagnostic("bundle-format", "/format", "This is not a Kampánykörút campaign bundle."));
  if (parsed.formatVersion !== BUNDLE_FORMAT_VERSION) diagnostics.push(diagnostic("bundle-version", "/formatVersion", "Only bundle format version 1 is supported."));
  if (typeof parsed.campaignId !== "string" || !SAFE_ID.test(parsed.campaignId)) diagnostics.push(diagnostic("bundle-id", "/campaignId", "Use 1–64 lowercase letters, numbers, _ or -."));
  if (typeof parsed.route !== "string" || !SAFE_ID.test(parsed.route)) diagnostics.push(diagnostic("bundle-route", "/route", "Use 1–64 lowercase letters, numbers, _ or -."));
  if (!isRecord(parsed.files)) {
    diagnostics.push(diagnostic("bundle-files", "/files", "files must be an object."));
  } else {
    const entries = Object.entries(parsed.files);
    if (entries.length === 0 || entries.length > MAX_FILES) diagnostics.push(diagnostic("bundle-file-count", "/files", `A bundle must contain 1–${MAX_FILES} files.`));
    for (const [path, value] of entries) {
      if (!isSafePath(path)) diagnostics.push(diagnostic("bundle-path", `/files/${path}`, "File paths must stay inside the bundle."));
      if (new Blob([JSON.stringify(value)]).size > MAX_FILE_BYTES) diagnostics.push(diagnostic("bundle-file-too-large", `/files/${path}`, "A file is larger than 512 KiB."));
      checkJsonValue(value, `/files/${path}`, diagnostics);
    }
    if (!("manifest.json" in parsed.files)) diagnostics.push(diagnostic("bundle-manifest", "/files", "manifest.json is required."));
  }
  if (!Array.isArray(parsed.assetPaths) || !parsed.assetPaths.every((path) => typeof path === "string" && path.startsWith("/images/"))) diagnostics.push(diagnostic("bundle-assets", "/assetPaths", "assetPaths must contain only existing /images/ paths."));
  if (diagnostics.length > 0) return { diagnostics };

  const bundle = parsed as unknown as CampaignBundle;
  const source: CampaignSource = {
    readCampaignFile: (_route, path) =>
      Object.prototype.hasOwnProperty.call(bundle.files, path)
        ? { ok: true, data: bundle.files[path] }
        : { ok: false, reason: "missing" },
    publicFileExists: (path) => bundle.assetPaths.includes(path),
  };
  diagnostics.push(...validateCampaign({ id: bundle.campaignId, route: bundle.route }, source));
  return { bundle, diagnostics };
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]));
}

export function serializeCampaignBundle(bundle: CampaignBundle) {
  return `${JSON.stringify(sortJson(bundle), null, 2)}\n`;
}

export function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
