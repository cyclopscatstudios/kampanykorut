import { singleton } from "tsyringe";
import { Emitter } from "./Emitter";
import type { ConfigEngine } from "./ConfigEngine";
import { createLogger } from "../logger";
import type { CampaignState, VoterEnvironment } from "../domain";
import type { DistrictGroupEngine } from "../domain/DistrictGroupEngine";
import type { SessionKey, StorageEngine } from "./StorageEngine";
import type { IdGenerator } from "./IdGenerator";
import type { HistoryItem, StateHandler } from "./StateHandler";

export type SavedCampaignSessionInfo = {
  sessionId: string;
  name: string;
  lastSaved?: string;
};

const MAX_SAVED_SESSIONS = 5;

const log = createLogger("CampaignStateEngine");

@singleton()
export class StateEngine extends Emitter<CampaignState> {
  private sessionId: string | undefined;
  private campaignState: CampaignState | null = null;

  constructor(
    private gameConfigEngine: ConfigEngine,
    private voterEnvironment: VoterEnvironment,
    private districtGroupEngine: DistrictGroupEngine,
    private storage: StorageEngine,
    private stateHandler: StateHandler,
    private generateId: IdGenerator,
  ) {
    log.debug("CampaignStateEngine initialized");
    super();
    this.getCampaignState = this.getCampaignState.bind(this);
    this.updateCampaignState = this.updateCampaignState.bind(this);
    this.safeStringify = this.safeStringify.bind(this);
    this.saveState = this.saveState.bind(this);
    this.saveCampaignStateManually = this.saveCampaignStateManually.bind(this);
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

  getCampaignState(): CampaignState | null {
    const sessionId = this.getSessionId();
    const savedState = this.storage.getItem(
      "campaignState",
      "localStorage",
      sessionId,
    );
    const parsed = savedState ? JSON.parse(savedState) : null;
    return this.campaignState ?? parsed;
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

  saveCampaignStateManually(name?: string) {
    const electionState = this.stateHandler.get("gameState");
    const history = this.stateHandler.get("history");
    this.saveState(electionState, "electionConfig", name);
    this.saveState(history, "questionHistory", name);
    this.storage.setItem(
      "campaignState",
      JSON.stringify(this.campaignState),
      "localStorage",
    );
  }

  updateCampaignState(state: Partial<CampaignState> | null) {
    if (!state) {
      log.debug("Clearing campaign session");
      const sessionId = this.getSessionId();
      this.campaignState = null;
      this.storage.clearItem(`campaignState-${sessionId}`, "localStorage");
      return;
    }

    const sessionId = this.getSessionId();
    const currentCampaignState = this.getCurrentCampaignState();

    const updated = {
      ...(currentCampaignState ?? {}),
      ...state,
    } as CampaignState;

    this.campaignState = updated;

    this.storage.setItem(
      `campaignState-${sessionId}`,
      JSON.stringify(updated),
      "localStorage",
    );
    log.debug("Election state saved for sessionId:", sessionId);
  }

  saveState<T>(session: T, sessionKey: SessionKey, sessionName?: string) {
    const value = this.safeStringify(session);
    if (!value) {
      log.error("no value was provided");
      return null;
    }
    if (sessionKey === "campaignState") {
      this.updateCampaignState(session as CampaignState);
    }
    if (sessionKey === "questionHistory") {
      this.updateQuestionHistory(session as HistoryItem);
    }
    this.saveToSlot(sessionName);
  }

  clearGameState() {
    this.gameConfigEngine.configure(null);
    this.voterEnvironment.configure(null);
    this.districtGroupEngine.configure();
  }

  private getCurrentCampaignState() {
    const sessionId = this.getSessionId();
    const storedCampaignState = this.storage.getItem(
      "campaignState",
      "localStorage",
      sessionId,
    );
    const parsed = storedCampaignState
      ? (JSON.parse(storedCampaignState) as CampaignState)
      : null;
    return this.campaignState ?? parsed;
  }

  private saveToSlot(sessionName?: string) {
    const sessionId = this.getSessionId();
    const campaignId = JSON.parse(
      this.storage.getItem("campaignState", "localStorage", sessionId) ?? "",
    ).activeCampaignId;
    const sessionDate = this.getNormalizedDateString();
    const name = sessionName ?? `auto-save-${campaignId}-${sessionDate}`;
    this.saveSessionInfo({
      sessionId,
      name: name ?? "auto-save",
      lastSaved: new Date().toISOString(),
    });
    log.debug("Session info updated for sessionId:", sessionId);
  }

  private updateQuestionHistory(historyItem: HistoryItem) {
    const sessionId = this.getSessionId();
    const currentHistory = this.storage.getItem(
      "questionHistory",
      "localStorage",
      sessionId,
    );
    let newHistory: HistoryItem[] = [];
    if (currentHistory) {
      const parsed = JSON.parse(currentHistory) as HistoryItem[];
      newHistory = [...parsed];
    }
    newHistory.push(historyItem);
    const value = JSON.stringify(newHistory);
    this.storage.setItem(`questionHistory-${sessionId}`, value, "localStorage");
    log.debug("Question history saved for sessionId:", sessionId);
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

  private getNormalizedDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  }
}
