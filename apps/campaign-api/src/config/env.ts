import { z } from "zod";

const GITHUB_APP_KEYS = [
  "GITHUB_APP_ID",
  "GITHUB_APP_PRIVATE_KEY",
  "GITHUB_APP_INSTALLATION_ID",
] as const;

const STORAGE_KEYS = [
  "S3_BUCKET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "ASSETS_PUBLIC_URL",
] as const;

const KEY_GROUPS = [
  { keys: GITHUB_APP_KEYS, label: "GITHUB_APP_*" },
  { keys: STORAGE_KEYS, label: "S3_* / ASSETS_PUBLIC_URL" },
];

const EnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    HOST: z.string().min(1).default("0.0.0.0"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    API_DOCS_ENABLED: z.stringbool().default(true),
    TRUST_PROXY: z.stringbool().default(false),
    GIT_COMMIT: z.string().default("unknown"),
    SITE_URL: z.url().default("https://kampanykorut.hu"),
    GITHUB_APP_ID: z.string().min(1).optional(),
    GITHUB_APP_PRIVATE_KEY: z.string().min(1).optional(),
    GITHUB_APP_INSTALLATION_ID: z.string().min(1).optional(),
    GITHUB_REPO: z
      .string()
      .regex(/^[\w.-]+\/[\w.-]+$/, "Expected owner/name")
      .default("cyclopscatstudios/kampanykorut"),
    GITHUB_NEWS_CATEGORY: z.string().min(1).default("Hírek"),
    GITHUB_WEBHOOK_SECRET: z.string().min(16).optional(),
    NEWS_SYNC_INTERVAL_MINUTES: z.coerce.number().min(0).default(15),
    MONGODB_URI: z
      .string()
      .regex(/^mongodb(\+srv)?:\/\//, "Expected a mongodb:// URI")
      .optional(),
    S3_ENDPOINT: z.url().optional(),
    S3_REGION: z.string().min(1).default("auto"),
    S3_BUCKET: z.string().min(1).optional(),
    S3_ACCESS_KEY_ID: z.string().min(1).optional(),
    S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    ASSETS_PUBLIC_URL: z.url().optional(),
  })
  .superRefine((env, ctx) => {
    for (const { keys, label } of KEY_GROUPS) {
      const missing = keys.filter((key) => env[key] === undefined);
      if (missing.length === 0 || missing.length === keys.length) continue;

      for (const key of missing) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `Required when any ${label} variable is set`,
        });
      }
    }
  })
  .transform((env) => ({
    env: env.NODE_ENV,
    host: env.HOST,
    port: env.PORT,
    logLevel: env.LOG_LEVEL,
    docsEnabled: env.API_DOCS_ENABLED,
    trustProxy: env.TRUST_PROXY,
    gitCommit: env.GIT_COMMIT,
    siteUrl: env.SITE_URL.replace(/\/+$/, ""),
    github: githubConfig(env),
    mongoUri: env.MONGODB_URI ?? null,
    storage: storageConfig(env),
  }));

function storageConfig(env: {
  S3_ENDPOINT?: string;
  S3_REGION: string;
  S3_BUCKET?: string;
  S3_ACCESS_KEY_ID?: string;
  S3_SECRET_ACCESS_KEY?: string;
  ASSETS_PUBLIC_URL?: string;
}) {
  if (
    !env.S3_BUCKET ||
    !env.S3_ACCESS_KEY_ID ||
    !env.S3_SECRET_ACCESS_KEY ||
    !env.ASSETS_PUBLIC_URL
  ) {
    return null;
  }

  return {
    endpoint: env.S3_ENDPOINT ?? null,
    region: env.S3_REGION,
    bucket: env.S3_BUCKET,
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    publicUrl: env.ASSETS_PUBLIC_URL.replace(/\/+$/, ""),
  };
}

function githubConfig(env: {
  GITHUB_APP_ID?: string;
  GITHUB_APP_PRIVATE_KEY?: string;
  GITHUB_APP_INSTALLATION_ID?: string;
  GITHUB_REPO: string;
  GITHUB_NEWS_CATEGORY: string;
  GITHUB_WEBHOOK_SECRET?: string;
  NEWS_SYNC_INTERVAL_MINUTES: number;
}) {
  if (
    !env.GITHUB_APP_ID ||
    !env.GITHUB_APP_PRIVATE_KEY ||
    !env.GITHUB_APP_INSTALLATION_ID
  ) {
    return null;
  }

  const [owner, name] = env.GITHUB_REPO.split("/") as [string, string];

  return {
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n"),
    installationId: env.GITHUB_APP_INSTALLATION_ID,
    repo: { owner, name },
    newsCategory: env.GITHUB_NEWS_CATEGORY,
    webhookSecret: env.GITHUB_WEBHOOK_SECRET ?? null,
    newsSyncIntervalMs:
      env.NEWS_SYNC_INTERVAL_MINUTES > 0
        ? env.NEWS_SYNC_INTERVAL_MINUTES * 60_000
        : null,
  };
}

export type AppConfig = z.output<typeof EnvSchema>;
export type GithubConfig = NonNullable<AppConfig["github"]>;
export type StorageConfig = NonNullable<AppConfig["storage"]>;

export function loadConfig(
  source: Record<string, string | undefined> = process.env,
): AppConfig {
  const result = EnvSchema.safeParse(source);

  if (!result.success) {
    throw new Error(
      `Invalid environment configuration:\n${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}
