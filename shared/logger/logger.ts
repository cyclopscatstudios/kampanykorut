type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  message: string;
  data?: unknown;
  context?: Record<string, unknown>;
}

const isProd = import.meta.env.PROD;

function log(level: LogLevel, payload: LogPayload) {
  const { message, data, context } = payload;

  if (level === "debug" && isProd) return;

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
    // TODO: send to remote logging (Sentry, Datadog, stb.)
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
