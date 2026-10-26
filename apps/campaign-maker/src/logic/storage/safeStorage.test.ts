import { describe, expect, it, vi } from "vitest";
import { writeStorageValue } from "./safeStorage";

describe("safe storage writes", () => {
  it.each(["QuotaExceededError", "SecurityError"])(
    "reports %s without attempting recovery writes",
    (name) => {
      const storage = {
        setItem: vi.fn().mockImplementation(() => {
          throw new DOMException("denied", name);
        }),
      };
      expect(writeStorageValue(storage, "new-key", { valid: true })).toBe(
        false,
      );
      expect(storage.setItem).toHaveBeenCalledOnce();
    },
  );

  it("does not call storage when serialization fails", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const storage = { setItem: vi.fn() };
    expect(writeStorageValue(storage, "new-key", circular)).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
