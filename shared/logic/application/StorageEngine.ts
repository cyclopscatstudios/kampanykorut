import { singleton } from "tsyringe";
import { createLogger } from "../../logger";

export type StorageType = "localStorage" | "sessionStorage";

const log = createLogger("StorageEngine");

@singleton()
export class StorageEngine<TKey extends string = string> {
  constructor(private readonly prefix: string = "app") {
    log.debug(`StorageEngine initialized with prefix "${prefix}"`);
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);
    this.clearItem = this.clearItem.bind(this);
    this.getPrefixedKey = this.getPrefixedKey.bind(this);
  }

  getItem(
    key: TKey,
    storageType: StorageType = "localStorage",
    suffix?: string,
  ) {
    const prefixedKey = this.withSuffix(this.getPrefixedKey(key), suffix);
    if (storageType === "localStorage") {
      return localStorage.getItem(prefixedKey);
    }
    return sessionStorage.getItem(prefixedKey);
  }

  setItem(
    key: string,
    value: string,
    storageType: StorageType = "localStorage",
    suffix?: string,
  ) {
    const prefixedKey = this.withSuffix(this.getPrefixedKey(key), suffix);
    if (storageType === "localStorage") {
      localStorage.setItem(prefixedKey, value);
      return;
    }
    sessionStorage.setItem(prefixedKey, value);
  }

  clearItem(
    key: string,
    storageType: StorageType = "localStorage",
    suffix?: string,
  ) {
    const prefixedKey = this.withSuffix(this.getPrefixedKey(key), suffix);
    if (storageType === "localStorage") {
      localStorage.removeItem(prefixedKey);
      return;
    }
    sessionStorage.removeItem(prefixedKey);
  }

  clearAll() {
    localStorage.clear();
  }

  getPrefixedKey(key: string) {
    return `${this.prefix}_${key}`;
  }

  getKeyWithoutPrefix(prefixedKey: string) {
    const withSeparator = `${this.prefix}_`;
    return prefixedKey.startsWith(withSeparator)
      ? prefixedKey.slice(withSeparator.length)
      : prefixedKey;
  }

  private withSuffix(key: string, suffix?: string) {
    return suffix ? `${key}-${suffix}` : key;
  }
}
