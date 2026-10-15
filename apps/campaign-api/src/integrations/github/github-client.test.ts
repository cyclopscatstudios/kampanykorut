import { createVerify, generateKeyPairSync } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { GithubConfig } from "../../config/env";
import { createAppJwt, GithubClient, GithubError } from "./github-client";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});

const config: GithubConfig = {
  appId: "12345",
  privateKey,
  installationId: "678",
  repo: { owner: "cyclopscatstudios", name: "kampanykorut" },
  newsCategory: "Hírek",
  webhookSecret: null,
  newsSyncIntervalMs: null,
};

const NOW = new Date("2026-10-15T12:00:00Z");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

function fakeGithub(graphqlBody: unknown = { data: { ok: true } }) {
  return vi.fn<typeof fetch>(async (input) => {
    const url = String(input);
    if (url.endsWith("/access_tokens")) {
      return json({ token: "ghs_test", expires_at: "2026-10-15T13:00:00Z" });
    }
    if (url.endsWith("/graphql")) return json(graphqlBody);
    return json({ message: "Not Found" }, 404);
  });
}

describe("createAppJwt", () => {
  it("signs a backdated RS256 token for the app", () => {
    const jwt = createAppJwt("12345", privateKey, NOW);
    const [header, payload, signature] = jwt.split(".") as [
      string,
      string,
      string,
    ];

    const verified = createVerify("RSA-SHA256")
      .update(`${header}.${payload}`)
      .verify(publicKey, Buffer.from(signature, "base64url"));
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    const issuedAt = NOW.getTime() / 1000 - 60;

    expect(verified).toBe(true);
    expect(claims).toEqual({
      iss: "12345",
      iat: issuedAt,
      exp: issuedAt + 540,
    });
  });
});

describe("GithubClient", () => {
  it("runs GraphQL queries with an installation token", async () => {
    const fetchFn = fakeGithub();
    const client = new GithubClient(config, fetchFn, () => NOW);

    const data = await client.graphql("query { ok }", { a: 1 });

    expect(data).toEqual({ ok: true });
    const [tokenUrl, tokenInit] = fetchFn.mock.calls[0]!;
    expect(String(tokenUrl)).toBe(
      "https://api.github.com/app/installations/678/access_tokens",
    );
    expect(new Headers(tokenInit?.headers).get("authorization")).toMatch(
      /^Bearer ey/,
    );
    const [, gqlInit] = fetchFn.mock.calls[1]!;
    expect(new Headers(gqlInit?.headers).get("authorization")).toBe(
      "Bearer ghs_test",
    );
    expect(JSON.parse(String(gqlInit?.body))).toEqual({
      query: "query { ok }",
      variables: { a: 1 },
    });
  });

  it("reuses the installation token until shortly before it expires", async () => {
    const fetchFn = fakeGithub();
    let now = NOW;
    const client = new GithubClient(config, fetchFn, () => now);

    await Promise.all([
      client.graphql("query { ok }"),
      client.graphql("query { ok }"),
    ]);
    now = new Date("2026-10-15T12:50:00Z");
    await client.graphql("query { ok }");
    now = new Date("2026-10-15T12:56:00Z");
    await client.graphql("query { ok }");

    const tokenCalls = fetchFn.mock.calls.filter(([url]) =>
      String(url).endsWith("/access_tokens"),
    );
    expect(tokenCalls).toHaveLength(2);
  });

  it("surfaces GraphQL errors", async () => {
    const client = new GithubClient(
      config,
      fakeGithub({ errors: [{ message: "Field 'x' doesn't exist" }] }),
      () => NOW,
    );

    await expect(client.graphql("query { x }")).rejects.toThrow(
      /Field 'x' doesn't exist/,
    );
  });

  it("reports HTTP failures with their status", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => json({}, 401));
    const client = new GithubClient(config, fetchFn, () => NOW);

    const error: unknown = await client
      .graphql("query { ok }")
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(GithubError);
    expect((error as GithubError).status).toBe(401);
  });
});
