import * as Sentry from "@sentry/react";
import { buildInfo } from "../../buildInfo";
import { scrubSentryData } from "./sentryScrub";

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn && !import.meta.env.PLAYWRIGHT) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: `kampanykorut@${buildInfo.version}+${buildInfo.gitCommit}`,
    enabled: import.meta.env.PROD,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    tracePropagationTargets: ["localhost", import.meta.env.VITE_SUPABASE_URL],
    enableLogs: true,
    sendDefaultPii: false,
    beforeBreadcrumb: (breadcrumb) => scrubSentryData(breadcrumb),
    beforeSend: (event) => scrubSentryData(event),
    beforeSendTransaction: (event) => scrubSentryData(event),
  });
}
