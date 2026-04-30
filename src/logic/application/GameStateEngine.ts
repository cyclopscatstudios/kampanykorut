import { singleton } from "tsyringe";
import { Emitter } from "./Emitter";
import type { GameConfigEngine } from "./GameConfigEngine";
import { gameModeRegistry } from "./gameModeRegistery";
import { createLogger } from "../logger";
import type { VoterEnvironment } from "../domain";
import type { DistrictGroupEngine } from "../domain/DistrictGroupEngine";
import type { SessionKey, StorageEngine } from "./StorageEngine";
import type { IdGenerator } from "./IdGenerator";
import type { PlayerSide } from "../types";
import type { StateHandler } from "./StateHandler";

export type CampaignState = {
  activeCampaignId: string | null;
  playerSide?: PlayerSide;
};

export type SavedCampaignSessionInfo = {
  sessionId: string;
  name: string;
  lastSaved?: string;
};

const MAX_SAVED_SESSIONS = 5;

const log = createLogger("GameStateEngine");

@singleton()
export class GameStateEngine extends Emitter<CampaignState> {
  private sessionId: string | undefined;
  private campaignState: CampaignState = {
    activeCampaignId: null,
  };

  constructor(
    private gameConfigEngine: GameConfigEngine,
    private voterEnvironment: VoterEnvironment,
    private districtGroupEngine: DistrictGroupEngine,
    private storage: StorageEngine,
    private stateHandler: StateHandler,
    private generateId: IdGenerator,
  ) {
    log.debug("GameStateEngine initialized");
    super();
    this.getCampaignState = this.getCampaignState.bind(this);
    this.updateCampaignState = this.updateCampaignState.bind(this);
    this.safeStringify = this.safeStringify.bind(this);
    this.saveElectionState = this.saveElectionState.bind(this);
    this.saveGameState = this.saveGameState.bind(this);
    this.init();
  }

  init() {
    if (this.shouldGenerateNewSessionId()) {
      const id = this.generateId();
      log.debug("New session ID generated:", id);
      this.sessionId = id;
      this.saveSessionId(id);
    }
  }

  getSavedGameSessions() {
    const savedSessions = this.storage.getItem("savedSessions", "localStorage");
    return savedSessions
      ? (JSON.parse(savedSessions) as SavedCampaignSessionInfo[])
      : [];
  }

  getSessionSlots() {
    const usedSlots = this.getSavedGameSessions();
    return {
      usedSlots,
      availableSlots: MAX_SAVED_SESSIONS - usedSlots.length,
    };
  }

  saveGameState(name?: string) {
    const electionState = this.stateHandler.get("gameState");
    const history = this.stateHandler.get("history");
    this.saveElectionState(electionState, "electionConfig", name);
    this.saveElectionState(history, "questionHistory", name);
    this.storage.setItem(
      "campaignState",
      JSON.stringify(this.campaignState),
      "localStorage",
    );
  }

  saveElectionState<T>(
    session: T,
    sessionKey: SessionKey,
    sessionName?: string,
  ) {
    const value = this.safeStringify(session);
    if (!value) {
      log.error("failed to save to storage");
      return null;
    }
    const sessionId = this.getSessionId();
    if (sessionKey === "electionConfig") {
      this.storage.setItem(
        `electionConfig-${sessionId}`,
        value,
        "localStorage",
      );
      log.debug("Election state saved for sessionId:", sessionId);
    }
    if (sessionKey === "questionHistory") {
      this.storage.setItem(
        `questionHistory-${sessionId}`,
        value,
        "localStorage",
      );
      log.debug("Question history saved for sessionId:", sessionId);
    }
    const campaignId = JSON.parse(
      this.storage.getItem("campaignState", "localStorage") ?? "",
    ).campaignId;
    const sessionDate = this.getNormalizedDateString();
    const name = sessionName ?? `auto-save-${campaignId}-${sessionDate}`;
    this.saveSessionInfo({
      sessionId,
      name: name ?? "auto-save",
      lastSaved: new Date().toISOString(),
    });
    log.debug("Session info updated for sessionId:", sessionId);
  }

  getElectionState() {
    return this.storage.getItem("electionConfig", "localStorage");
  }

  getCampaignState(): CampaignState {
    const savedState = this.storage.getItem("campaignState", "localStorage");
    const parsed = savedState ? JSON.parse(savedState) : null;
    return this.campaignState ?? parsed;
  }

  getCampaignSession() {
    const session = this.getElectionState();
    return session ? JSON.parse(session) : null;
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

  updateCampaignState(campaignState: Partial<CampaignState>) {
    log.debug("Update campaign state with ", campaignState);
    this.campaignState = { ...this.campaignState, ...campaignState };
    if (campaignState.activeCampaignId) {
      this.gameConfigEngine.configure(
        this.getConfigByGameId(campaignState.activeCampaignId),
      );
    }
    this.notify(this.campaignState);
  }

  clearGameState() {
    this.gameConfigEngine.configure(null);
    this.voterEnvironment.configure(null);
    this.districtGroupEngine.configure();
  }

  private saveSessionId(sessionId: string) {
    this.storage.setItem("currentSessionId", sessionId, "localStorage");
  }

  private saveSessionInfo(sessionInfo: SavedCampaignSessionInfo) {
    const raw = this.storage.getItem("savedSessions", "localStorage");

    let sessions: SavedCampaignSessionInfo[] = [];

    try {
      sessions = raw ? JSON.parse(raw) : [];
    } catch {
      sessions = [];
    }

    const exists = sessions.some((s) => s.sessionId === sessionInfo.sessionId);

    const updated = exists
      ? sessions.map((s) =>
          s.sessionId === sessionInfo.sessionId ? sessionInfo : s,
        )
      : [...sessions, sessionInfo];

    this.storage.setItem(
      "savedSessions",
      JSON.stringify(updated),
      "localStorage",
    );
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

  private getConfigByGameId(gameId: string) {
    return gameModeRegistry[gameId].electionConfig;
  }

  private getNormalizedDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  }
}
