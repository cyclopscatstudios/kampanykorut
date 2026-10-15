import { singleton } from "tsyringe";
import { createLogger } from "../../logger";

export type StorageType = "localStorage" | "sessionStorage";

export type StorageWriteErrorReason = "quota" | "unknown";

export type StorageWriteErrorListener = (
  reason: StorageWriteErrorReason,
  key: string,
  error: unknown,
) => void;

const log = createLogger("StorageEngine");

@singleton()
export class StorageEngine<TKey extends string = string> {
  private writeErrorListeners = new Set<StorageWriteErrorListener>();
  private unsavedValues: Record<StorageType, Map<string, string>> = {
    localStorage: new Map(),
    sessionStorage: new Map(),
  };

  constructor(private readonly prefix: string = "app") {
    log.debug(`StorageEngine initialized with prefix "${prefix}"`);
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);
    this.clearItem = this.clearItem.bind(this);
    this.clearItemsWithPrefix = this.clearItemsWithPrefix.bind(this);
    this.onWriteError = this.onWriteError.bind(this);
    this.getPrefixedKey = this.getPrefixedKey.bind(this);
  }

  getItem(
    key: TKey,
    storageType: StorageType = "localStorage",
    suffix?: string,
  ) {
    const prefixedKey = this.withSuffix(this.getPrefixedKey(key), suffix);
    const unsaved = this.unsavedValues[storageType].get(prefixedKey);
    if (unsaved !== undefined) {
      return unsaved;
    }
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
  ): boolean {
    const prefixedKey = this.withSuffix(this.getPrefixedKey(key), suffix);
    try {
      if (storageType === "localStorage") {
        localStorage.setItem(prefixedKey, value);
      } else {
        sessionStorage.setItem(prefixedKey, value);
      }
      this.unsavedValues[storageType].delete(prefixedKey);
      return true;
    } catch (error) {
      const reason = isQuotaExceededError(error) ? "quota" : "unknown";
      log.error(`failed to write "${prefixedKey}" to ${storageType}`, {
        reason,
        size: value.length,
        error,
      });
      this.unsavedValues[storageType].set(prefixedKey, value);
      this.writeErrorListeners.forEach((listener) =>
        listener(reason, prefixedKey, error),
      );
      return false;
    }
  }

  onWriteError(listener: StorageWriteErrorListener) {
    this.writeErrorListeners.add(listener);
    return () => {
      this.writeErrorListeners.delete(listener);
    };
  }

  clearItem(
    key: string,
    storageType: StorageType = "localStorage",
    suffix?: string,
  ) {
    const prefixedKey = this.withSuffix(this.getPrefixedKey(key), suffix);
    this.unsavedValues[storageType].delete(prefixedKey);
    if (storageType === "localStorage") {
      localStorage.removeItem(prefixedKey);
      return;
    }
    sessionStorage.removeItem(prefixedKey);
  }

  clearItemsWithPrefix(key: string) {
    const prefixedKey = this.getPrefixedKey(key);
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const storedKey = localStorage.key(i);
      if (storedKey?.startsWith(prefixedKey)) {
        keys.push(storedKey);
      }
    }
    keys.forEach((storedKey) => localStorage.removeItem(storedKey));
    return keys;
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

function isQuotaExceededError(error: unknown) {
  if (!(error instanceof DOMException)) {
    return false;
  }
  return (
    error.name === "QuotaExceededError" ||
    // Firefox
    error.name === "NS_ERROR_DOM_QUOTA_REACHED"
  );
}
