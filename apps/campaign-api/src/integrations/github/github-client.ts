import { createSign } from "node:crypto";
import type { GithubConfig } from "../../config/env";

const API_URL = "https://api.github.com";
const API_VERSION = "2022-11-28";
const USER_AGENT = "kampanykorut-campaign-api";
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;
const JWT_CLOCK_SKEW_S = 60;
const JWT_LIFETIME_S = 9 * 60;

export class GithubError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly graphqlTypes: string[] = [],
  ) {
    super(message);
    this.name = "GithubError";
  }

  get isNotFound(): boolean {
    return this.status === 404 || this.graphqlTypes.includes("NOT_FOUND");
  }
}

interface GraphqlResponse<T> {
  data?: T;
  errors?: { message: string; type?: string; path?: string[] }[];
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

export function createAppJwt(
  appId: string,
  privateKey: string,
  now: Date = new Date(),
): string {
  const iat = Math.floor(now.getTime() / 1000) - JWT_CLOCK_SKEW_S;
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ iat, exp: iat + JWT_LIFETIME_S, iss: appId }),
  );
  const signature = createSign("RSA-SHA256")
    .update(`${header}.${payload}`)
    .sign(privateKey);

  return `${header}.${payload}.${base64url(signature)}`;
}

export class GithubClient {
  private token: { value: string; expiresAt: number } | null = null;
  private pendingToken: Promise<string> | null = null;

  constructor(
    private readonly config: GithubConfig,
    private readonly fetchFn: typeof fetch = fetch,
    private readonly now: () => Date = () => new Date(),
  ) {}

  get repo() {
    return this.config.repo;
  }

  async graphql<T>(
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<T> {
    const res = await this.request("/graphql", {
      method: "POST",
      headers: { authorization: `Bearer ${await this.installationToken()}` },
      body: JSON.stringify({ query, variables }),
    });

    const body = (await res.json()) as GraphqlResponse<T>;

    if (body.errors?.length) {
      throw new GithubError(
        `GitHub GraphQL error: ${body.errors.map((e) => e.message).join("; ")}`,
        undefined,
        body.errors.flatMap((e) => (e.type ? [e.type] : [])),
      );
    }
    if (!body.data) {
      throw new GithubError("GitHub GraphQL response has no data");
    }

    return body.data;
  }

  async rest<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await this.request(path, {
      method,
      headers: { authorization: `Bearer ${await this.installationToken()}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  private async installationToken(): Promise<string> {
    if (
      this.token &&
      this.token.expiresAt - TOKEN_REFRESH_MARGIN_MS > this.now().getTime()
    ) {
      return this.token.value;
    }

    this.pendingToken ??= this.fetchInstallationToken().finally(() => {
      this.pendingToken = null;
    });

    return this.pendingToken;
  }

  private async fetchInstallationToken(): Promise<string> {
    const jwt = createAppJwt(
      this.config.appId,
      this.config.privateKey,
      this.now(),
    );
    const res = await this.request(
      `/app/installations/${this.config.installationId}/access_tokens`,
      { method: "POST", headers: { authorization: `Bearer ${jwt}` } },
    );
    const body = (await res.json()) as { token: string; expires_at: string };

    this.token = {
      value: body.token,
      expiresAt: new Date(body.expires_at).getTime(),
    };

    return body.token;
  }

  private async request(path: string, init: RequestInit): Promise<Response> {
    const res = await this.fetchFn(`${API_URL}${path}`, {
      ...init,
      headers: {
        accept: "application/vnd.github+json",
        "content-type": "application/json",
        "user-agent": USER_AGENT,
        "x-github-api-version": API_VERSION,
        ...init.headers,
      },
    });

    if (!res.ok) {
      throw new GithubError(
        `GitHub ${init.method ?? "GET"} ${path} failed with ${res.status}`,
        res.status,
      );
    }

    return res;
  }
}
