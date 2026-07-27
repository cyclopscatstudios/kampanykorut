import { useEffect } from "react";
import { api } from "@/logic/application";
import { createLogger } from "@/shared/logger";

const HEALTH_CHECK_INTERVAL_MS = 2000;

const log = createLogger("useHealthCheckPolling");

export function useHealthCheckPolling() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      api.healthCheck().catch((error: unknown) => {
        log.warn("Health check failed", error);
      });
    }, HEALTH_CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);
}
