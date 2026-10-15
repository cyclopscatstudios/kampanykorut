import { z } from "zod";

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
  })
  .transform((env) => ({
    env: env.NODE_ENV,
    host: env.HOST,
    port: env.PORT,
    logLevel: env.LOG_LEVEL,
    docsEnabled: env.API_DOCS_ENABLED,
    trustProxy: env.TRUST_PROXY,
    gitCommit: env.GIT_COMMIT,
  }));

export type AppConfig = z.output<typeof EnvSchema>;

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
