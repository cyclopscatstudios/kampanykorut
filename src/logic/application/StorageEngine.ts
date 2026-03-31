import { singleton } from "tsyringe";
import type { SessionKey } from "./StateEngine";

export type StorageType = "localStorage" | "sessionStorage";

@singleton()
export class StorageEngine {
  constructor() {
    this.getItem = this.getItem.bind(this);
    this.getLocalStorageItem = this.getLocalStorageItem.bind(this);
  }

  getItem(key: SessionKey, storageType: StorageType) {
    const prefixedKey = this.getPrefixedKey(key);
    if (storageType === "localStorage") {
      return this.getLocalStorageItem(prefixedKey);
    }
    return this.getSessionStorageItem(prefixedKey);
  }

  setItem(key: SessionKey, value: string, storageType: StorageType) {
    const prefixedKey = this.getPrefixedKey(key);
    if (storageType === "localStorage") {
      return this.setLocalStorageItem(prefixedKey, value);
    }
    return this.setSessionStorageItem(prefixedKey, value);
  }

  clear() {
    localStorage.clear();
  }

  private getPrefixedKey(key: SessionKey) {
    return `kampanykorut_${key}`;
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
