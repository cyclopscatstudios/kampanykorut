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
      github: null,
    });
  });

  it("parses string values from the environment", () => {
    const config = loadConfig({
      NODE_ENV: "production",
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
});
