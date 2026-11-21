import type { PlayTimeEventRequest } from "@/shared/types";
import { sendPlayTimeEvent } from "./playTimeApi";

export const HEARTBEAT_INTERVAL_MS = 30_000;

export interface PlayTimeTarget {
  sessionId: string;
  campaignId: string;
  phase: "playing" | "finished";
}

type Send = (sessionId: string, event: PlayTimeEventRequest) => void;

const GAME_PATH =
  /^\/game\/([^/]+)(?:\/(dashboard|coalition|end-results))?\/?$/;

export function playTimePhase(
  pathname: string,
): Pick<PlayTimeTarget, "campaignId" | "phase"> | null {
  const match = GAME_PATH.exec(pathname);
  if (!match) return null;
  return {
    campaignId: decodeURIComponent(match[1]),
    phase: match[2] === "end-results" ? "finished" : "playing",
  };
}

export class PlayTimeTracker {
  private current: PlayTimeTarget | null = null;
  private detach: (() => void) | null = null;

  constructor(
    private readonly send: Send = sendPlayTimeEvent,
    private readonly doc: Document = document,
    private readonly win: Window = window,
  ) {}

  update(target: PlayTimeTarget | null) {
    const previous = this.current;
    if (
      previous &&
      target &&
      previous.sessionId === target.sessionId &&
      previous.phase === target.phase
    ) {
      return;
    }

    this.stopListening();
    this.current = target?.phase === "playing" ? target : null;

    if (target?.phase === "finished") {
      this.emit(target, "finish");
      return;
    }
    if (previous?.phase === "playing") this.emit(previous, "pause");
    if (target) this.listen(target);
  }

  private listen(target: PlayTimeTarget) {
    const visible = () => this.doc.visibilityState === "visible";
    const onVisibility = () => this.emit(target, visible() ? "start" : "pause");
    const onPageHide = () => this.emit(target, "pause");
    const onPageShow = () => visible() && this.emit(target, "start");
    const heartbeat = this.win.setInterval(() => {
      if (visible()) this.emit(target, "heartbeat");
    }, HEARTBEAT_INTERVAL_MS);

    this.doc.addEventListener("visibilitychange", onVisibility);
    this.win.addEventListener("pagehide", onPageHide);
    this.win.addEventListener("pageshow", onPageShow);
    this.detach = () => {
      this.win.clearInterval(heartbeat);
      this.doc.removeEventListener("visibilitychange", onVisibility);
      this.win.removeEventListener("pagehide", onPageHide);
      this.win.removeEventListener("pageshow", onPageShow);
    };

    if (visible()) this.emit(target, "start");
  }

  private stopListening() {
    this.detach?.();
    this.detach = null;
  }

  private emit(target: PlayTimeTarget, type: PlayTimeEventRequest["type"]) {
    this.send(target.sessionId, { type, campaignId: target.campaignId });
  }
}
