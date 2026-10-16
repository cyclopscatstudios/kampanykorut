import { describe, expect, it } from "vitest";
import { loadConfig } from "./env";

describe("loadConfig", () => {
  it("applies defaults for an empty environment", () => {
    expect(loadConfig({})).toEqual({
      env: "development",
      host: "0.0.0.0",
      port: 4000,
      logLevel: "info",
      docsEnabled: true,
      trustProxy: false,
      gitCommit: "unknown",
      siteUrl: "https://kampanykorut.hu",
      assetsDir: null,
      github: null,
      mongoUri: null,
      storage: null,
    });
  });

  it("parses string values from the environment", () => {
    const config = loadConfig({
      NODE_ENV: "production",
      MONGODB_URI: "mongodb://mongo:27017/kampanykorut",
      PORT: "8080",
      API_DOCS_ENABLED: "false",
      TRUST_PROXY: "true",
    });

    expect(config).toMatchObject({
      env: "production",
      port: 8080,
      docsEnabled: false,
      trustProxy: true,
    });
  });

  it("requires MongoDB in production", () => {
    expect(() => loadConfig({ NODE_ENV: "production" })).toThrow(
      /Required in production[\s\S]*MONGODB_URI/,
    );
    expect(loadConfig({ NODE_ENV: "development" }).mongoUri).toBeNull();
  });

  it("rejects invalid values with a readable message", () => {
    expect(() => loadConfig({ PORT: "not-a-port" })).toThrow(/PORT/);
    expect(() => loadConfig({ NODE_ENV: "staging" })).toThrow(/NODE_ENV/);
  });

  it("enables the GitHub App only when all of its credentials are set", () => {
    const config = loadConfig({
      GITHUB_APP_ID: "12345",
      GITHUB_APP_PRIVATE_KEY: "-----BEGIN KEY-----\\nabc\\n-----END KEY-----",
      GITHUB_APP_INSTALLATION_ID: "678",
      GITHUB_REPO: "acme/game",
    });

    expect(config.github).toEqual({
      appId: "12345",
      privateKey: "-----BEGIN KEY-----\nabc\n-----END KEY-----",
      installationId: "678",
      repo: { owner: "acme", name: "game" },
      newsCategory: "Hírek",
      webhookSecret: null,
      newsSyncIntervalMs: 900_000,
    });
    expect(() => loadConfig({ GITHUB_APP_ID: "12345" })).toThrow(
      /GITHUB_APP_PRIVATE_KEY[\s\S]*GITHUB_APP_INSTALLATION_ID/,
    );
    expect(() => loadConfig({ GITHUB_REPO: "no-slash" })).toThrow(
      /GITHUB_REPO/,
    );
  });

  it("configures object storage only when it is complete", () => {
    const config = loadConfig({
      MONGODB_URI: "mongodb+srv://user:pw@cluster.example.net/kampanykorut",
      S3_ENDPOINT: "https://account.r2.cloudflarestorage.com",
      S3_BUCKET: "assets",
      S3_ACCESS_KEY_ID: "key",
      S3_SECRET_ACCESS_KEY: "secret",
      ASSETS_PUBLIC_URL: "https://cdn.kampanykorut.hu/",
    });

    expect(config.mongoUri).toBe(
      "mongodb+srv://user:pw@cluster.example.net/kampanykorut",
    );
    expect(config.storage).toEqual({
      endpoint: "https://account.r2.cloudflarestorage.com",
      region: "auto",
      bucket: "assets",
      accessKeyId: "key",
      secretAccessKey: "secret",
      publicUrl: "https://cdn.kampanykorut.hu",
    });
    expect(() => loadConfig({ S3_BUCKET: "assets" })).toThrow(
      /ASSETS_PUBLIC_URL/,
    );
    expect(() => loadConfig({ MONGODB_URI: "postgres://x" })).toThrow(
      /MONGODB_URI/,
    );
  });
});
