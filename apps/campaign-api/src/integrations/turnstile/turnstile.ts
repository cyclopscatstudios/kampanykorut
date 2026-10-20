import { z } from "zod";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TIMEOUT_MS = 5000;

const SiteverifyResponse = z.object({
  success: z.boolean(),
  "error-codes": z.array(z.string()).default([]),
});

export interface TurnstileResult {
  success: boolean;
  errorCodes: string[];
}

export class TurnstileVerifier {
  constructor(
    private readonly secret: string,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  async verify(token: string, remoteIp?: string): Promise<TurnstileResult> {
    const form = new URLSearchParams({ secret: this.secret, response: token });
    if (remoteIp) form.set("remoteip", remoteIp);

    const res = await this.fetchFn(SITEVERIFY_URL, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`Turnstile siteverify failed with ${res.status}`);
    }

    const body = SiteverifyResponse.parse(await res.json());
    return { success: body.success, errorCodes: body["error-codes"] };
  }
}
