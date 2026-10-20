import { Type } from "typebox";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type App, buildApp } from "./app";
import { type AppConfig, loadConfig } from "./config/env";

const testConfig = (overrides: Partial<AppConfig> = {}): AppConfig => ({
  ...loadConfig({ NODE_ENV: "test", LOG_LEVEL: "silent" }),
  ...overrides,
});

describe("app", () => {
  let app: App;

  afterEach(async () => {
    await app?.close();
  });

  it("answers the liveness probe", async () => {
    app = await buildApp(testConfig({ version: "1.2.3", gitCommit: "abc123" }));

    const res = await app.inject({ method: "GET", url: "/health" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      status: "ok",
      version: "1.2.3",
      commit: "abc123",
    });
    expect(res.headers["x-request-id"]).toBeTruthy();
  });

  it("propagates an incoming request id", async () => {
    app = await buildApp(testConfig());

    const res = await app.inject({
      method: "GET",
      url: "/health",
      headers: { "x-request-id": "req-42" },
    });

    expect(res.headers["x-request-id"]).toBe("req-42");
  });

  it("reports readiness based on registered checks", async () => {
    app = await buildApp(testConfig());
    app.addReadinessCheck("ok-dependency", async () => {});
    app.addReadinessCheck("broken-dependency", async () => {
      throw new Error("unreachable");
    });

    const res = await app.inject({ method: "GET", url: "/ready" });

    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({
      status: "not_ready",
      checks: { "ok-dependency": "ok", "broken-dependency": "fail" },
    });
  });

  it("fails a readiness check that never settles", async () => {
    app = await buildApp(testConfig());
    app.addReadinessCheck("hanging-dependency", () => new Promise(() => {}));

    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      const pending = app.inject({ method: "GET", url: "/ready" });
      await vi.advanceTimersByTimeAsync(5000);
      const res = await pending;

      expect(res.statusCode).toBe(503);
      expect(res.json()).toMatchObject({
        checks: { "hanging-dependency": "fail" },
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("is ready when there are no failing checks", async () => {
    app = await buildApp(testConfig());

    const res = await app.inject({ method: "GET", url: "/ready" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ready", checks: {} });
  });

  it("returns problem+json for unknown routes", async () => {
    app = await buildApp(testConfig());

    const res = await app.inject({ method: "GET", url: "/api/v1/nope" });

    expect(res.statusCode).toBe(404);
    expect(res.headers["content-type"]).toContain("application/problem+json");
    expect(res.json()).toMatchObject({
      status: 404,
      title: "Not Found",
      instance: "/api/v1/nope",
    });
  });

  it("returns field-level validation errors as problem+json", async () => {
    app = await buildApp(testConfig());
    app.post(
      "/echo",
      { schema: { body: Type.Object({ name: Type.String() }) } },
      async (request) => request.body,
    );

    const res = await app.inject({
      method: "POST",
      url: "/echo",
      payload: { name: { first: "Viktor" } },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({
      status: 400,
      errors: [{ path: "/name" }],
    });
  });

  it("hides internal error details", async () => {
    app = await buildApp(testConfig());
    app.get("/boom", async () => {
      throw new Error("secret connection string");
    });

    const res = await app.inject({ method: "GET", url: "/boom" });

    expect(res.statusCode).toBe(500);
    expect(res.body).not.toContain("secret");
    expect(res.json()).toMatchObject({
      status: 500,
      requestId: res.headers["x-request-id"],
    });
  });

  it("serves the OpenAPI spec when docs are enabled", async () => {
    app = await buildApp(testConfig());

    const res = await app.inject({ method: "GET", url: "/api/v1/docs/json" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      openapi: "3.1.0",
      paths: { "/health": {}, "/ready": {} },
    });
  });

  it("does not expose docs when disabled", async () => {
    app = await buildApp(testConfig({ docsEnabled: false }));

    const res = await app.inject({ method: "GET", url: "/api/v1/docs/json" });

    expect(res.statusCode).toBe(404);
  });
});
