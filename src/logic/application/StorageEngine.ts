import { singleton } from "tsyringe";
import { createLogger } from "../logger";

export type StorageType = "localStorage" | "sessionStorage";

export type SessionKey =
  | "electionConfig"
  | "menuSession"
  | "devSession"
  | "questionHistory"
  | "settings"
  | "gameConfig"
  | "campaignState"
  | "currentSessionId"
  | "savedSessions";

const log = createLogger("StorageEngine");

@singleton()
export class StorageEngine {
  constructor() {
    log.debug("StorageEngine initialized");
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);
    this.getLocalStorageItem = this.getLocalStorageItem.bind(this);
    this.getPrefixedKey = this.getPrefixedKey.bind(this);
  }

  getItem(key: SessionKey, storageType: StorageType) {
    const prefixedKey = this.getPrefixedKey(key);
    if (storageType === "localStorage") {
      return this.getLocalStorageItem(prefixedKey);
    }
    return this.getSessionStorageItem(prefixedKey);
  }

  setItem(key: string, value: string, storageType: StorageType) {
    const prefixedKey = this.getPrefixedKey(key);
    if (storageType === "localStorage") {
      return this.setLocalStorageItem(prefixedKey, value);
    }
    return this.setSessionStorageItem(prefixedKey, value);
  }

  clearItem(key: string, storageType: StorageType) {
    const prefixedKey = this.getPrefixedKey(key);
    if (storageType === "localStorage") {
      return localStorage.removeItem(prefixedKey);
    }
    return sessionStorage.removeItem(prefixedKey);
  }

  clearAll() {
    localStorage.clear();
  }

  getPrefixedKey(key: string) {
    return `kampanykorut_${key}`;
  }

  getKeyWithoutPrefix(prefixedKey: string) {
    return prefixedKey.replace(/^kampanykorut_/, "");
  }

  private getLocalStorageItem(key: string) {
    return localStorage.getItem(key);
  }

  private setLocalStorageItem(key: string, value: string) {
    return localStorage.setItem(key, value);
  }

  private getSessionStorageItem(key: string) {
    return sessionStorage.getItem(key);
  }

  private setSessionStorageItem(key: string, value: string) {
    return sessionStorage.setItem(key, value);
  }
}
