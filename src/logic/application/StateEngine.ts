import { inject, singleton } from "tsyringe";
import type { GameState } from "../domain/CampaignEngine";
import { createLogger } from "../logger";
import { StorageEngine } from "./StorageEngine";
import type { IdGenerator } from "./IdGenerator";

const log = createLogger("StorageEngine");

export type SessionKey =
  | "gameSession"
  | "menuSession"
  | "devSession"
  | "questionHistory"
  | "settings"
  | "gameConfig"
  | "campaignSession"
  | "currentSessionId";

@singleton()
export class StateEngine {
  private sessionId: string | undefined;

  constructor(
    @inject(StorageEngine) private storage: StorageEngine,
    @inject("IdGenerator") private generateId: IdGenerator,
  ) {
    log.debug("StateEngine initialized");
    this.loadGameState = this.loadGameState.bind(this);
    this.loadSession = this.loadSession.bind(this);
    this.safeStringify = this.safeStringify.bind(this);
    this.saveSession = this.saveSession.bind(this);
    this.init();
  }

  init() {
    if (this.shouldGenerateNewSessionId()) {
      log.debug("Generating new session ID");
      const id = this.generateId();
      this.sessionId = id;
      this.saveSessionId(id);
    }
  }

  saveSession<T>(session: T, sessionKey: SessionKey) {
    const value = this.safeStringify(session);
    if (!value) {
      log.error("failed to save to storage");
      return null;
    }
    if (sessionKey === "gameSession") {
      const sessionId = this.getSessionId();
      return this.storage.setItem(
        `gameSession-${sessionId}`,
        value,
        "localStorage",
      );
    }
    if (sessionKey === "questionHistory") {
      const sessionId = this.getSessionId();
      return this.storage.setItem(
        `questionHistory-${sessionId}`,
        value,
        "localStorage",
      );
    }
    return this.storage.setItem("menuSession", value, "localStorage");
  }

  loadSession(sessionKey: SessionKey) {
    if (sessionKey === "gameSession") {
      const session = this.loadGameState();
      return session;
    }
  }

  saveSessionId(sessionId: string) {
    this.storage.setItem("currentSessionId", sessionId, "localStorage");
  }

  getSessionId() {
    const sessionId = this.storage.getItem("currentSessionId", "localStorage");
    if (sessionId) {
      this.sessionId = sessionId;
      return this.sessionId;
    }
    const id = this.generateId();
    this.sessionId = id;
    this.storage.setItem("currentSessionId", id, "localStorage");
    return id;
  }

  private loadGameState() {
    const sessionId = this.getSessionId();
    log.debug("Loading game session with sessionId:", sessionId);
    const session = this.storage.getItem("gameSession", "localStorage");
    if (!session) {
      log.debug("no session found, starting new game session");
      return null;
    }
    return this.safeParse(session) as GameState;
  }

  private safeParse<T>(value: string | null): T | null {
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      log.error("failed to parse JSON from storage", error);
      return null;
    }
  }

  private safeStringify(value: unknown) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      log.error("failed to stringify value to storage", error);
    }
  }

  private shouldGenerateNewSessionId() {
    const { sessionId, pathname } = this.chechUrlParams();
    if (pathname.includes("/game") && sessionId) {
      return false;
    }
    return true;
  }

  private chechUrlParams() {
    const { pathname } = window.location;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("sessionId");
    return { sessionId, pathname };
  }
}
