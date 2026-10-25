export const REDACTED = "[redacted]";

const SENSITIVE_KEYS = new Set([
  "answer",
  "answerid",
  "rawanswer",
  "partyid",
  "candidateid",
  "playerside",
  "playersideid",
  "playercandidateid",
  "selecteddistrict",
  "visiteddistrict",
  "decision",
  "history",
  "historyentry",
]);

const SESSION_ID_PARAM = /([?&]sessionId=)[^&#\s"]+/gi;

export function redactSessionIdParam(value: string) {
  return value.replace(SESSION_ID_PARAM, `$1${REDACTED}`);
}

function isSensitiveKey(key: string) {
  const normalized = key.toLowerCase();
  return SENSITIVE_KEYS.has(normalized) || normalized.endsWith("sessionid");
}

export function scrubSentryData<T>(value: T): T {
  if (typeof value === "string") {
    return redactSessionIdParam(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => scrubSentryData(item)) as T;
  }
  if (value && typeof value === "object" && !(value instanceof Error)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        isSensitiveKey(key) ? REDACTED : scrubSentryData(item),
      ]),
    ) as T;
  }
  return value;
}
