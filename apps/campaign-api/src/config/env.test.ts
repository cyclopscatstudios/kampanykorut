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
});
