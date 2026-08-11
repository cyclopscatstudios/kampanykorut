import * as Sentry from "@sentry/react";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  message: string;
  data?: unknown;
  context?: Record<string, unknown>;
}

const isProd = import.meta.env.PROD;

const environment = import.meta.env.VITE_ENVIRONMENT;

const debugEnabled = environment === "development" || environment === "dev";

function log(level: LogLevel, payload: LogPayload) {
  if (level === "debug" && !debugEnabled) {
    return;
  }

  const { message, data, context } = payload;

  const prefix = `[${level.toUpperCase()}]`;

  if (level === "debug") {
    console.debug(prefix, message, data ?? "", context ?? "");
  } else if (level === "info") {
    console.info(prefix, message, data ?? "", context ?? "");
  } else if (level === "warn") {
    console.warn(prefix, message, data ?? "", context ?? "");
  } else {
    console.error(prefix, message, data ?? "", context ?? "");
  }

  if (isProd) {
    if (level === "error") {
      if (data instanceof Error) {
        Sentry.captureException(data, {
          extra: { message, ...context },
        });
      } else {
        Sentry.captureMessage(message, {
          level: "error",
          extra: { data, ...context },
        });
      }
    } else {
      Sentry.addBreadcrumb({
        category: level,
        message,
        level: level === "warn" ? "warning" : "info",
        data: { ...context, data },
      });
    }
  }
}

const logger = {
  debug(message: string, data?: unknown, context?: Record<string, unknown>) {
    log("debug", { message, data, context });
  },

  info(message: string, data?: unknown, context?: Record<string, unknown>) {
    log("info", { message, data, context });
  },

  warn(message: string, data?: unknown, context?: Record<string, unknown>) {
    log("warn", { message, data, context });
  },

  error(message: string, data?: unknown, context?: Record<string, unknown>) {
    log("error", { message, data, context });
  },
};

export function createLogger(scope: string) {
  return {
    debug: (msg: string, data?: unknown) =>
      logger.debug(`[${scope}] ${msg}`, data),

    info: (msg: string, data?: unknown) =>
      logger.info(`[${scope}] ${msg}`, data),

    warn: (msg: string, data?: unknown) =>
      logger.warn(`[${scope}] ${msg}`, data),

    error: (msg: string, data?: unknown) =>
      logger.error(`[${scope}] ${msg}`, data),
  };
}
