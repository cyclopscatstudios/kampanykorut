import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { container } from "tsyringe";
import { useSettings } from "../hooks/useSettings";
import { StateEngine } from "../StateEngine";
import { playTimePhase, PlayTimeTracker } from "./PlayTimeTracker";

let tracker: PlayTimeTracker | null = null;
const getTracker = () => (tracker ??= new PlayTimeTracker());

export function usePlayTimeTracking() {
  const { pathname } = useLocation();
  const { settings } = useSettings();
  const enabled = settings.analyticsEnabled !== false;

  useEffect(() => {
    const phase = enabled ? playTimePhase(pathname) : null;
    getTracker().update(
      phase && {
        ...phase,
        sessionId: container.resolve(StateEngine).getSessionId(),
      },
    );
  }, [pathname, enabled]);

  useEffect(() => () => getTracker().update(null), []);
}
