import { inject, singleton } from "tsyringe";
import type { GameState } from "../domain/CampaignEngine";
import { createLogger } from "../logger";
import { StorageEngine } from "./StorageEngine";

const log = createLogger("StorageEngine");

export type SessionKey = "gameSession" | "menuSession" | "devSession";

@singleton()
export class StateEngine {
  constructor(@inject(StorageEngine) private storage: StorageEngine) {
    this.loadGameState = this.loadGameState.bind(this);
    this.loadSession = this.loadSession.bind(this);
    this.safeStringify = this.safeStringify.bind(this);
    this.saveSession = this.saveSession.bind(this);
  }

  saveSession<T>(session: T, sessionKey: SessionKey) {
    const value = this.safeStringify(session);
    if (!value) {
      log.error("failed to save to storage");
      return null;
    }
    if (sessionKey === "gameSession") {
      return this.storage.setItem("gameSession", value, "localStorage");
    }
    return this.storage.setItem("menuSession", value, "localStorage");
  }

  loadSession(sessionKey: SessionKey) {
    if (sessionKey === "gameSession") {
      return this.loadGameState();
    }
    return this.loadMenuSession();
  }

  private loadGameState() {
    const session = this.storage.getItem("gameSession", "localStorage");
    if (!session) {
      log.info("no session found, starting new game session");
      return null;
    }
    return this.safeParse(session) as GameState;
  }

  private loadMenuSession() {
    const session = this.storage.getItem("menuSession", "localStorage");
    // TODO: set return type to menu type
    return this.safeParse(session) as any;
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
}
