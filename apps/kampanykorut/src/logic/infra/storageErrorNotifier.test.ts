import { beforeEach, describe, expect, it, vi } from "vitest";
import { StorageEngine } from "@/shared/logic/application/StorageEngine";
import { initStorageErrorNotifier } from "./storageErrorNotifier";

const { toasterMock } = vi.hoisted(() => ({ toasterMock: vi.fn() }));

vi.mock("../../components/ui/gameplay/toaster", () => ({
  toaster: toasterMock,
}));

describe("initStorageErrorNotifier", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error global override
    global.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new DOMException("exceeded the quota", "QuotaExceededError");
      }),
    };
  });

  it("shows a single error toast when saving keeps failing", () => {
    const storage = new StorageEngine("kampanykorut");
    initStorageErrorNotifier(storage);

    storage.setItem("campaignState", "{}", "localStorage", "s1");
    storage.setItem("turnHistory", "[]", "localStorage", "s1");

    expect(toasterMock).toHaveBeenCalledTimes(1);
    expect(toasterMock).toHaveBeenCalledWith(
      expect.any(String),
      "Error",
      expect.objectContaining({ id: "storage-write-error" }),
    );
  });
});
