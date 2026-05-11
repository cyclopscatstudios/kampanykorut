import { singleton } from "tsyringe";
import { createLogger } from "../logger";

export type StorageType = "localStorage" | "sessionStorage";

export type SessionKey =
  | "electionConfig"
  | "campaignConfig"
  | "menuSession"
  | "devSession"
  | "questionHistory"
  | "settings"
  | "gameConfig"
  | "campaignState"
  | "currentSessionId"
  | "savedSessions"
  | "language";

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

  getItem(key: SessionKey, storageType: StorageType, suffix?: string) {
    const prefixedKey = this.getPrefixedKey(key);
    if (storageType === "localStorage") {
      return this.getLocalStorageItem(prefixedKey, suffix);
    }
    return this.getSessionStorageItem(prefixedKey);
  }

  setItem(
    key: string,
    value: string,
    storageType: StorageType,
    suffix?: string,
  ) {
    const prefixedKey = this.getPrefixedKey(key);
    if (storageType === "localStorage") {
      return this.setLocalStorageItem(prefixedKey, value, suffix);
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

  private getLocalStorageItem(key: string, suffix?: string) {
    let fullKey = key;
    if (suffix) {
      fullKey = `${key}-${suffix}`;
    }
    return localStorage.getItem(fullKey);
  }

  private setLocalStorageItem(key: string, value: string, suffix?: string) {
    let fullKey = key;
    if (suffix) {
      fullKey = `${key}-${suffix}`;
    }
    return localStorage.setItem(fullKey, value);
  }

  private getSessionStorageItem(key: string) {
    return sessionStorage.getItem(key);
  }

  private setSessionStorageItem(key: string, value: string) {
    return sessionStorage.setItem(key, value);
  }
}
