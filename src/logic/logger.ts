type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  message: string;
  data?: unknown;
  context?: Record<string, unknown>;
}

const isProd = import.meta.env.PROD;

function log(level: LogLevel, payload: LogPayload) {
  const { message, data, context } = payload;

  const prefix = `[${level.toUpperCase()}]`;

  if (level === "info") {
    console.info(prefix, message, data ?? "", context ?? "");
  } else if (level === "warn") {
    console.warn(prefix, message, data ?? "", context ?? "");
  } else {
    console.error(prefix, message, data ?? "", context ?? "");
  }

  if (isProd) {
    // todo
  }
}

const logger = {
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
    info: (msg: string, data?: unknown) =>
      logger.info(`[${scope}] ${msg}`, data),
    warn: (msg: string, data?: unknown) =>
      logger.warn(`[${scope}] ${msg}`, data),
    error: (msg: string, data?: unknown) =>
      logger.error(`[${scope}] ${msg}`, data),
  };
}
