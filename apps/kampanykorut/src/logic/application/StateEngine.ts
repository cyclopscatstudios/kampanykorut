import { singleton } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { DistrictGroupEngine, VoterEnvironment } from "@/shared/domain";
import { createLogger } from "@/shared/logger/logger";
import { CampaignState } from "@/shared/types";
import type { ConfigEngine } from "./ConfigEngine";
import { Emitter } from "./Emitter";
import type { IdGenerator } from "./IdGenerator";
import type { Navigation } from "./navigation/Navigation";
import {
  DEFAULT_CAMPAIGN_ID,
  type HistoryItem,
  type StateHandler,
} from "./StateHandler";
import type { SessionKey, StorageEngine } from "./StorageEngine";

export type SavedCampaignSessionInfo = {
  id: string;
  sessionId: string;
  campaignId: string;
  name: string;
  lastSaved?: string;
};

const MAX_SAVED_SESSIONS = 5;

const log = createLogger("CampaignStateEngine");

export type ClearTypes = "restart" | "exit";

@singleton()
export class StateEngine extends Emitter<CampaignState> {
  constructor(
    private gameConfigEngine: ConfigEngine,
    private voterEnvironment: VoterEnvironment,
    private districtGroupEngine: DistrictGroupEngine,
    private storage: StorageEngine,
    private generateId: IdGenerator,
    private navigation: Navigation,
    private stateHandler: StateHandler,
  ) {
    log.debug("CampaignStateEngine initialized");
    super();
    this.getCampaignState = this.getCampaignState.bind(this);
    this.updateCampaignState = this.updateCampaignState.bind(this);
    this.safeStringify = this.safeStringify.bind(this);
    this.saveState = this.saveState.bind(this);
    this.init();
  }

  init(force = false) {
    if (this.shouldGenerateNewSessionId(force)) {
      const id = this.generateId();
      log.debug("New session ID generated:", id);
      this.saveSessionId(id);
    }
  }

  getHistory(): HistoryItem[] | null {
    const sessionId = this.getSessionId();
    const history = this.storage.getItem(
      "turnHistory",
      "localStorage",
      sessionId,
    );
    return history ? JSON.parse(history) : null;
  }

  getSavedGameSessions() {
    const savedSessions = this.storage.getItem("savedSessions", "localStorage");
    if (!savedSessions) {
      return [];
    }
    const parsed = JSON.parse(savedSessions) as SavedCampaignSessionInfo[];
    let needsMigration = false;
    const migrated = parsed.map((s) => {
      if (s.id) {
        return s;
      }
      needsMigration = true;
      return {
        ...s,
        id: uuidv4(),
      };
    });
    if (needsMigration) {
      this.storage.setItem(
        "savedSessions",
        JSON.stringify(migrated),
        "localStorage",
      );
    }
    return migrated;
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
    return savedState ? JSON.parse(savedState) : null;
  }

  getTurnHistory() {
    const sessionId = this.getSessionId();
    const history = this.storage.getItem(
      "turnHistory",
      "localStorage",
      sessionId,
    );
    return history ? JSON.parse(history) : null;
  }

  getSessionId() {
    const urlSessionId = this.chechUrlParams().sessionId;
    const sessionId =
      urlSessionId || this.storage.getItem("currentSessionId", "localStorage");
    if (sessionId) {
      const saveSessionId = this.stateHandler.get("sessionId");
      if (saveSessionId !== sessionId) {
        this.stateHandler.set("sessionId", sessionId);
      }
      return sessionId;
    }
    const id = this.generateId();
    this.stateHandler.set("sessionId", id);
    this.storage.setItem("currentSessionId", id, "localStorage");
    return id;
  }

  loadState(session: SavedCampaignSessionInfo | null) {
    if (!session) {
      log.error("no session was provided");
      return;
    }
    const { campaignId, sessionId } = session;
    if (!campaignId || !sessionId) {
      log.error("id was not found");
      return;
    }
    const history = this.storage.getItem(
      "turnHistory",
      "localStorage",
      sessionId,
    );
    if (!history) {
      log.error("history was not found");
      return;
    }
    this.saveSessionId(session.sessionId);
    const state = this.getCampaignStateById(session.sessionId);
    if (!state) {
      log.error("campaign state was not found");
      return;
    }

    this.stateHandler.set("campaignState", state);

    const route = `/game/${campaignId}?sessionId=${sessionId}`;
    const isGameRoute = this.navigation.isUrlParamMatch("/game/");
    if (!isGameRoute) {
      this.navigation.go(route);
      return;
    }
    window.location.reload();
  }

  saveState<T>(sessionKey: SessionKey, session: T) {
    const value = this.safeStringify(session);
    if (!value) {
      log.error("no value was provided");
      return null;
    }
    if (sessionKey === "campaignState") {
      this.updateCampaignState(session as CampaignState);
    }
    if (sessionKey === "turnHistory") {
      this.updateTurnHistory(session as HistoryItem);
    }
  }

  saveToSlot(sessionName?: string, existingId?: string) {
    const sessionId = this.getSessionId();
    const raw = this.storage.getItem(
      "campaignState",
      "localStorage",
      sessionId,
    );
    const campaignId = raw
      ? JSON.parse(raw).activeCampaignId
      : this.stateHandler.get("campaignState")?.activeCampaignId;
    if (!campaignId || campaignId === DEFAULT_CAMPAIGN_ID) {
      log.error("no campaign id found, skipping slot save");
      return;
    }
    const sessionDate = this.getNormalizedDateString();
    const name = sessionName ?? `auto-save-${campaignId}-${sessionDate}`;
    this.saveSessionInfo({
      id: existingId ?? uuidv4(),
      sessionId,
      campaignId,
      name: name ?? "auto-save",
      lastSaved: new Date().toISOString(),
    });
    log.debug("Session info updated for sessionId:", sessionId);
  }

  cleanupUnsavedStates() {
    const states = this.getSessionKeyWithPrefix("kampanykorut_campaignState-");
    const histories = this.getSessionKeyWithPrefix("kampanykorut_turnHistory-");
    const savedStates = this.getSavedGameSessions();

    const savedSessionIds = new Set(savedStates.map((s) => s.sessionId));

    const orphanedStates = states.filter((stateKey) => {
      const state = stateKey.replace("kampanykorut_campaignState-", "");

      return !savedSessionIds.has(state);
    });

    const orphanedTurnHistories = histories.filter((key) => {
      const history = key.replace("kampanykorut_turnHistory-", "");

      return !savedSessionIds.has(history);
    });

    orphanedStates.forEach((key) => {
      localStorage.removeItem(key);
      log.debug("Cleared orphaned state with key:", key);
    });

    orphanedTurnHistories.forEach((key) => {
      localStorage.removeItem(key);
      log.debug("Cleared orphaned history with key:", key);
    });
  }

  campaignSelectorScreen() {}

  clearGameState(type: ClearTypes) {
    const state = this.getCurrentCampaignState();
    this.saveState("campaignState", null);
    this.gameConfigEngine.configure(null);
    this.voterEnvironment.configure(null);
    this.districtGroupEngine.configure([]);

    if (type === "restart") {
      this.init(true);
      window.location.reload();
      this.saveState("campaignState", {
        activeCampaignId: state?.activeCampaignId,
        playerSide: state?.playerSide,
      } as CampaignState);
    }
  }

  private getSessionKeyWithPrefix(prefix: string) {
    const keys = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (!key?.startsWith(prefix)) {
        continue;
      }

      keys.push(key);
    }

    return keys;
  }

  updateCampaignState(state: Partial<CampaignState> | null) {
    if (!state) {
      log.debug("Clearing campaign session");
      const sessionId = this.getSessionId();
      this.stateHandler.set("campaignState", null);
      this.storage.clearItem(`campaignState-${sessionId}`, "localStorage");
      return;
    }

    const sessionId = this.getSessionId();
    const currentCampaignState = this.getCurrentCampaignState();

    const updated = {
      ...(currentCampaignState ?? {}),
      ...state,
    } as CampaignState;

    this.stateHandler.set("campaignState", updated);

    this.storage.setItem(
      `campaignState-${sessionId}`,
      JSON.stringify(updated),
      "localStorage",
    );
    log.debug("Election state saved for sessionId:", sessionId);
  }

  private getCampaignStateById(id: string): CampaignState | null {
    const storedCampaignState = this.storage.getItem(
      "campaignState",
      "localStorage",
      id,
    );
    return storedCampaignState ? JSON.parse(storedCampaignState) : null;
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
    return parsed;
  }

  private updateTurnHistory(historyItem: HistoryItem) {
    const sessionId = this.getSessionId();
    const currentHistory = this.storage.getItem(
      "turnHistory",
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
    this.storage.setItem(`turnHistory-${sessionId}`, value, "localStorage");
    log.debug("Question history saved for sessionId:", sessionId);
  }

  private saveSessionId(sessionId: string) {
    this.stateHandler.set("sessionId", sessionId);
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

    const existingSave = sessions.find((s) => s.id === sessionInfo.id);

    let updated: SavedCampaignSessionInfo[];

    if (existingSave) {
      updated = sessions.map((s) =>
        s.id === sessionInfo.id ? sessionInfo : s,
      );
    } else {
      if (sessions.length >= MAX_SAVED_SESSIONS) {
        log.error(
          `cannot save: max ${MAX_SAVED_SESSIONS} saved sessions reached`,
        );
        return;
      }
      updated = [...sessions, sessionInfo];
    }

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

  private shouldGenerateNewSessionId(force: boolean) {
    if (force) {
      return true;
    }
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
